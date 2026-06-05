"""PNR (saved flight) business logic.

Operates on the in-memory store today; swap the body for DB repositories when
`DATABASE_URL` is configured. The signatures stay async so callers don't change.
"""

from fastapi import HTTPException

from app.models.schemas import CreatePnrInput, CurrentRisk, PnrStatus, PnrWithFlight
from app.services import store


async def list_pnrs(status: PnrStatus = "active") -> list[PnrWithFlight]:
    return [p for p in store.PNR_STORE if p.status == status]


async def create_pnr(payload: CreatePnrInput) -> PnrWithFlight:
    flight = next((f for f in store.FLIGHT_CATALOG if f.id == payload.flight_id), None)
    if flight is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "FLIGHT_NOT_FOUND", "message": "Zborul nu există."},
        )
    if any(p.flight.id == flight.id and p.status == "active" for p in store.PNR_STORE):
        raise HTTPException(
            status_code=409,
            detail={
                "code": "PNR_ALREADY_EXISTS",
                "message": "Acest zbor este deja în lista ta.",
            },
        )

    disruption = next(
        (d for d in store.DISRUPTIONS.values() if d.flight.id == flight.id), None
    )
    pnr = PnrWithFlight(
        id=store.next_pnr_id(),
        status="active",
        passenger_name=payload.passenger_name,
        seat_number=payload.seat_number,
        pnr_code=payload.pnr_code,
        flight=flight,
        current_risk=disruption.risk
        if disruption
        else CurrentRisk(
            level="low",
            probability=0.06,
            prediction_for=flight.scheduled_departure,
        ),
        disruption_id=disruption.id if disruption else None,
    )
    store.PNR_STORE.append(pnr)
    return pnr


async def cancel_pnr(pnr_id: str) -> None:
    pnr = next((p for p in store.PNR_STORE if p.id == pnr_id), None)
    if pnr is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "PNR_NOT_FOUND", "message": "Zborul nu a fost găsit."},
        )
    pnr.status = "cancelled"
