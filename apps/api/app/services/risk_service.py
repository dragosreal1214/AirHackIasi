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


async def risk_for(
    flight: FlightSummary, force_fog_iata: str | None = None
) -> tuple[CurrentRisk, str | None]:
    """(risk, disruption_id). `force_fog_iata` forces a high-risk reading for
    flights departing that airport — used to demo the monitor on clear days."""
    # Curated demo disruption takes precedence.
    for d in store.DISRUPTIONS.values():
        if d.flight.id == flight.id:
            return d.risk, d.id

    force_fog_iata = force_fog_iata or settings.FORCE_FOG_IATA or None
    if force_fog_iata and flight.origin_iata == force_fog_iata:
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
        risk = CurrentRisk(
            level=fog_model.risk_level(prob),
            probability=round(prob, 4),
            prediction_for=flight.scheduled_departure,
            explanation=fog_model.explain(feats, prob),
        )
        return risk, disruption_id_for(flight.id)

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
