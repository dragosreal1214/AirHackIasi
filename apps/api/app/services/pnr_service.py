"""PNR (saved flight) business logic.

DB-backed per-user when DATABASE_URL is set; otherwise the in-memory store.
Flights are resolved from the real LRIA schedule (flight_service); fog risk is
either the curated demo disruption or a live Open-Meteo + model forecast for
the flight's origin airport.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import HTTPException

from app.config import settings
from app.models.schemas import (
    CreatePnrInput,
    CurrentRisk,
    FlightSummary,
    FogWindow,
    PnrStatus,
    PnrWithFlight,
)
from app.services import flight_service, store


@asynccontextmanager
async def _session():
    from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: PLC0415

    from app.db.base import get_engine  # noqa: PLC0415

    maker = async_sessionmaker(get_engine(), expire_on_commit=False)
    async with maker() as db:
        yield db


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


async def _risk_for(flight: FlightSummary) -> tuple[CurrentRisk, str | None]:
    """(risk, disruption_id) — curated demo if present, else live forecast."""
    for d in store.DISRUPTIONS.values():
        if d.flight.id == flight.id:
            return d.risk, d.id
    if not settings.LIVE_FORECAST:
        return CurrentRisk(level="low", probability=0.05, prediction_for=flight.scheduled_departure), None
    try:
        from app.ml import airports as registry  # noqa: PLC0415
        from app.ml import fog_forecast  # noqa: PLC0415

        a = registry.get(flight.origin_iata)
        if a is not None:
            fc = await fog_forecast.forecast(a.lat, a.lon, airport=a.iata)
            if fc.get("available") and fc.get("hourly"):
                return _risk_from_forecast(fc, flight.scheduled_departure), None
    except Exception:  # noqa: BLE001 - never block on forecast
        pass
    return CurrentRisk(level="low", probability=0.05, prediction_for=flight.scheduled_departure), None


async def _enrich(flight_id: str, *, pnr_id: str, status: str, **extra) -> PnrWithFlight | None:
    flight = flight_service.get_flight(flight_id)
    if flight is None:
        return None
    risk, disruption_id = await _risk_for(flight)
    return PnrWithFlight(
        id=pnr_id,
        status=status,  # type: ignore[arg-type]
        flight=flight,
        current_risk=risk,
        disruption_id=disruption_id,
        **extra,
    )


async def list_pnrs(user_id: str, status: PnrStatus = "active") -> list[PnrWithFlight]:
    if not settings.db_enabled:
        return [p for p in store.PNR_STORE if p.status == status]

    from sqlalchemy import select  # noqa: PLC0415

    from app.db.models import Pnr  # noqa: PLC0415

    async with _session() as db:
        rows = (
            await db.execute(
                select(Pnr).where(Pnr.user_id == user_id, Pnr.status == status)
            )
        ).scalars().all()

    result: list[PnrWithFlight] = []
    for row in rows:
        enriched = await _enrich(
            row.flight_id,
            pnr_id=str(row.id),
            status=row.status,
            passenger_name=row.passenger_name,
            seat_number=row.seat_number,
            pnr_code=row.pnr_code,
        )
        if enriched:
            result.append(enriched)
    return result


async def create_pnr(user_id: str, payload: CreatePnrInput) -> PnrWithFlight:
    flight = flight_service.get_flight(payload.flight_id)
    if flight is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "FLIGHT_NOT_FOUND", "message": "Zborul nu există."},
        )
    risk, disruption_id = await _risk_for(flight)

    if not settings.db_enabled:
        if any(p.flight.id == flight.id and p.status == "active" for p in store.PNR_STORE):
            raise HTTPException(
                status_code=409,
                detail={"code": "PNR_ALREADY_EXISTS", "message": "Acest zbor este deja în lista ta."},
            )
        pnr = PnrWithFlight(
            id=store.next_pnr_id(),
            status="active",
            passenger_name=payload.passenger_name,
            seat_number=payload.seat_number,
            pnr_code=payload.pnr_code,
            flight=flight,
            current_risk=risk,
            disruption_id=disruption_id,
        )
        store.PNR_STORE.append(pnr)
        return pnr

    from sqlalchemy import select  # noqa: PLC0415
    from sqlalchemy.exc import IntegrityError  # noqa: PLC0415

    from app.db.models import Pnr  # noqa: PLC0415

    async with _session() as db:
        existing = (
            await db.execute(
                select(Pnr).where(
                    Pnr.user_id == user_id,
                    Pnr.flight_id == flight.id,
                    Pnr.status == "active",
                )
            )
        ).scalar_one_or_none()
        if existing is not None:
            raise HTTPException(
                status_code=409,
                detail={"code": "PNR_ALREADY_EXISTS", "message": "Acest zbor este deja în lista ta."},
            )
        row = Pnr(
            user_id=user_id,
            flight_id=flight.id,
            passenger_name=payload.passenger_name,
            seat_number=payload.seat_number,
            pnr_code=payload.pnr_code,
            status="active",
        )
        db.add(row)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=409,
                detail={"code": "PNR_ALREADY_EXISTS", "message": "Acest zbor este deja în lista ta."},
            ) from None
        await db.refresh(row)

    return PnrWithFlight(
        id=str(row.id),
        status="active",
        passenger_name=payload.passenger_name,
        seat_number=payload.seat_number,
        pnr_code=payload.pnr_code,
        flight=flight,
        current_risk=risk,
        disruption_id=disruption_id,
    )


async def cancel_pnr(user_id: str, pnr_id: str) -> None:
    if not settings.db_enabled:
        pnr = next((p for p in store.PNR_STORE if p.id == pnr_id), None)
        if pnr is None:
            raise HTTPException(
                status_code=404,
                detail={"code": "PNR_NOT_FOUND", "message": "Zborul nu a fost găsit."},
            )
        pnr.status = "cancelled"
        return

    import uuid as _uuid  # noqa: PLC0415

    from sqlalchemy import select  # noqa: PLC0415

    from app.db.models import Pnr  # noqa: PLC0415

    try:
        pid = _uuid.UUID(pnr_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=404,
            detail={"code": "PNR_NOT_FOUND", "message": "Zborul nu a fost găsit."},
        ) from None

    async with _session() as db:
        row = (
            await db.execute(select(Pnr).where(Pnr.id == pid, Pnr.user_id == user_id))
        ).scalar_one_or_none()
        if row is None:
            raise HTTPException(
                status_code=404,
                detail={"code": "PNR_NOT_FOUND", "message": "Zborul nu a fost găsit."},
            )
        row.status = "cancelled"
        await db.commit()
