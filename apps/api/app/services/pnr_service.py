"""PNR (saved flight) business logic.

DB-backed per-user when DATABASE_URL is set; otherwise uses the in-memory
store. Flight details + current fog risk are enriched from the in-memory
catalog (apps/api/app/services/store.py) in both modes — only the user's saved
PNRs are persisted.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import HTTPException

from app.config import settings
from app.models.schemas import CreatePnrInput, CurrentRisk, PnrStatus, PnrWithFlight
from app.services import store


@asynccontextmanager
async def _session():
    from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: PLC0415

    from app.db.base import get_engine  # noqa: PLC0415

    maker = async_sessionmaker(get_engine(), expire_on_commit=False)
    async with maker() as db:
        yield db


def _risk_for_flight(flight_id: str) -> tuple[CurrentRisk | None, str | None]:
    """(current_risk, disruption_id) for a catalog flight."""
    for d in store.DISRUPTIONS.values():
        if d.flight.id == flight_id:
            return d.risk, d.id
    flight = next((f for f in store.FLIGHT_CATALOG if f.id == flight_id), None)
    if flight is None:
        return None, None
    return (
        CurrentRisk(level="low", probability=0.06, prediction_for=flight.scheduled_departure),
        None,
    )


def _enrich(flight_id: str, *, pnr_id: str, status: str, **extra) -> PnrWithFlight | None:
    flight = next((f for f in store.FLIGHT_CATALOG if f.id == flight_id), None)
    if flight is None:
        return None
    risk, disruption_id = _risk_for_flight(flight_id)
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
        enriched = _enrich(
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
    flight = next(
        (f for f in store.FLIGHT_CATALOG if f.id == payload.flight_id), None
    )
    if flight is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "FLIGHT_NOT_FOUND", "message": "Zborul nu există."},
        )

    if not settings.db_enabled:
        if any(p.flight.id == flight.id and p.status == "active" for p in store.PNR_STORE):
            raise HTTPException(
                status_code=409,
                detail={"code": "PNR_ALREADY_EXISTS", "message": "Acest zbor este deja în lista ta."},
            )
        risk, disruption_id = _risk_for_flight(flight.id)
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
        enriched = _enrich(
            row.flight_id,
            pnr_id=str(row.id),
            status=row.status,
            passenger_name=row.passenger_name,
            seat_number=row.seat_number,
            pnr_code=row.pnr_code,
        )
        assert enriched is not None
        return enriched


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
            await db.execute(
                select(Pnr).where(Pnr.id == pid, Pnr.user_id == user_id)
            )
        ).scalar_one_or_none()
        if row is None:
            raise HTTPException(
                status_code=404,
                detail={"code": "PNR_NOT_FOUND", "message": "Zborul nu a fost găsit."},
            )
        row.status = "cancelled"
        await db.commit()
