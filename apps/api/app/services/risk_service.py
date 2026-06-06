"""Shared fog-risk computation for a flight.

Single source of truth used by PNRs, disruptions, and the monitor. Returns the
current risk plus a disruption id: the curated demo id, `d_<flight_id>` for any
flight the model flags high/critical, or None when it's calm.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.config import settings
from app.models.schemas import CurrentRisk, FlightSummary, FogWindow
from app.services import store

DISRUPTED_LEVELS = ("high", "critical")


def disruption_id_for(flight_id: str) -> str:
    return f"d_{flight_id}"


def _risk_from_forecast(fc: dict, dep_iso: str) -> CurrentRisk:
    dep = datetime.fromisoformat(dep_iso)
    best = None
    best_diff = None
    for h in fc["hourly"]:
        t = datetime.fromisoformat(h["time"])
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        diff = abs((t - dep).total_seconds())
        if best_diff is None or diff < best_diff:
            best_diff, best = diff, h
    level = best["level"] if best else "low"
    prob = best["probability"] if best else 0.05
    window = None
    if fc.get("windows"):
        w = fc["windows"][0]
        window = FogWindow(start=w["start"], end=w["end"])
    explanation = fc["peak"]["explanation"] if (level != "low" and fc.get("peak")) else None
    return CurrentRisk(
        level=level,
        probability=round(prob, 4),
        prediction_for=dep_iso,
        fog_window=window if level != "low" else None,
        explanation=explanation,
    )


async def risk_at_airport(iata: str, when_iso: str) -> CurrentRisk | None:
    """Fog risk at an arbitrary airport for a time — used for the destination
    end of a route. Returns None when unavailable/calm."""
    force = settings.FORCE_FOG_IATA or None
    if not settings.LIVE_FORECAST and not (force and iata == force):
        return None
    try:
        from app.ml import airports as registry  # noqa: PLC0415
        from app.ml import fog_forecast  # noqa: PLC0415

        a = registry.get(iata)
        if a is None:
            return None
        fc = await fog_forecast.forecast(a.lat, a.lon, airport=a.iata)
        if fc.get("available") and fc.get("hourly"):
            return _risk_from_forecast(fc, when_iso)
    except Exception:  # noqa: BLE001
        pass
    return None


async def destination_landing_risk(iata: str, when_iso: str) -> CurrentRisk:
    """Fog at the destination discounted by its landing capability (ILS cat).

    A CAT III field autolands in dense fog (low disruption); a CAT I field
    (RVR 550 m, like Iași) can't, so its fog stays a real diversion risk.
    """
    from app.ml import airport_ops  # noqa: PLC0415
    from app.ml import airports as registry  # noqa: PLC0415
    from app.ml.fog_model import fog_model  # noqa: PLC0415

    cap = airport_ops.capability(iata)
    fog = await risk_at_airport(iata, when_iso)
    fog_p = fog.probability if fog else 0.0
    disruption = round(fog_p * (1 - cap["mitigation"]), 4)

    a = registry.get(iata)
    city = a.city if a else iata
    cat, rvr = cap["category"], cap["min_rvr_m"]
    if cap["autoland"]:
        expl = (
            f"{city} ({iata}) are ILS {cat} — avioanele pot ateriza automat pe ceață "
            f"densă (RVR ~{rvr} m), deci ceața afectează rar aterizarea."
        )
    else:
        expl = (
            f"{city} ({iata}) are doar ILS {cat} (minim RVR {rvr} m) — pe ceață densă "
            f"aterizările pot fi amânate sau deviate."
        )
    return CurrentRisk(
        level=fog_model.risk_level(disruption),
        probability=disruption,
        prediction_for=when_iso,
        explanation=expl,
    )


async def bad_weather_at_airport(iata: str, when_iso: str) -> float:
    """Non-fog bad-weather probability (storms/precip/wind) at a time, from the
    live forecast scored by the bad-weather model. 0.0 when unavailable."""
    if not settings.LIVE_FORECAST and not settings.FORCE_FOG_IATA:
        return 0.0
    try:
        from app.ml import airports as registry  # noqa: PLC0415
        from app.ml import fog_forecast  # noqa: PLC0415
        from app.ml.bad_weather_model import bad_weather_model  # noqa: PLC0415

        a = registry.get(iata)
        if a is None:
            return 0.0
        fc = await fog_forecast.forecast(a.lat, a.lon, airport=a.iata)
        if not (fc.get("available") and fc.get("hourly")):
            return 0.0
        when = datetime.fromisoformat(when_iso)
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        best, best_diff = None, None
        for h in fc["hourly"]:
            t = datetime.fromisoformat(h["time"])
            if t.tzinfo is None:
                t = t.replace(tzinfo=timezone.utc)
            diff = abs((t - when).total_seconds())
            if best_diff is None or diff < best_diff:
                best, best_diff = h, diff
        if best is None:
            return 0.0
        feats = {
            "temperature": best["temperature"],
            "dewpoint_depression": best["dewpointDepression"],
            "wind_speed": best["windSpeed"],
            "humidity": best["humidity"],
            "hour": int(best["time"][11:13]),
            "month": int(best["time"][5:7]),
        }
        return round(bad_weather_model.predict_proba(feats), 4)
    except Exception:  # noqa: BLE001
        return 0.0


def _demo_high_risk(flight: FlightSummary) -> CurrentRisk:
    """A high fog-risk reading from the model's textbook fog inputs — used to
    pin demo flights / simulate fog without waiting for a real foggy day."""
    from app.ml.fog_model import fog_model  # noqa: PLC0415

    feats = {
        "temperature": 1.0,
        "dewpoint_depression": 0.0,
        "wind_speed": 1.0,
        "humidity": 100.0,
        "hour": 5.0,
        "month": 12.0,
    }
    prob = fog_model.predict_proba(feats)
    return CurrentRisk(
        level=fog_model.risk_level(prob),
        probability=round(prob, 4),
        prediction_for=flight.scheduled_departure,
        explanation=fog_model.explain(feats, prob),
    )


async def risk_for(
    flight: FlightSummary, force_fog_iata: str | None = None
) -> tuple[CurrentRisk, str | None]:
    """(risk, disruption_id). `force_fog_iata` forces a high-risk reading for
    flights departing that airport — used to demo the monitor on clear days."""
    # Curated demo disruption takes precedence.
    for d in store.DISRUPTIONS.values():
        if d.flight.id == flight.id:
            return d.risk, d.id

    # Specific real flights pinned to high-risk for the demo (alternatives stay
    # real — generated by the engine).
    if flight.flight_number in store.FORCED_HIGH_NUMBERS:
        return _demo_high_risk(flight), disruption_id_for(flight.id)

    force_fog_iata = force_fog_iata or settings.FORCE_FOG_IATA or None
    if force_fog_iata and flight.origin_iata == force_fog_iata:
        return _demo_high_risk(flight), disruption_id_for(flight.id)

    if not settings.LIVE_FORECAST:
        return CurrentRisk(level="low", probability=0.05, prediction_for=flight.scheduled_departure), None

    try:
        from app.ml import airports as registry  # noqa: PLC0415
        from app.ml import fog_forecast  # noqa: PLC0415

        a = registry.get(flight.origin_iata)
        if a is not None:
            fc = await fog_forecast.forecast(a.lat, a.lon, airport=a.iata)
            if fc.get("available") and fc.get("hourly"):
                risk = _risk_from_forecast(fc, flight.scheduled_departure)
                did = disruption_id_for(flight.id) if risk.level in DISRUPTED_LEVELS else None
                return risk, did
    except Exception:  # noqa: BLE001 - never block on forecast
        pass
    return CurrentRisk(level="low", probability=0.05, prediction_for=flight.scheduled_departure), None
