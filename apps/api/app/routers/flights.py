"""Flight search endpoints."""

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import FlightDetail, FlightSummary
from app.services import flight_detail, flight_service

router = APIRouter(prefix="/flights", tags=["flights"])


@router.get("/search", response_model=list[FlightSummary])
async def search_flights(
    q: str | None = Query(None, description="flight number or city"),
    date: str | None = Query(None, description="YYYY-MM-DD"),
    origin: str | None = Query(None, description="from (IATA or city)"),
    destination: str | None = Query(None, description="to (IATA or city)"),
) -> list[FlightSummary]:
    return await flight_service.search_flights(q, date, origin, destination)


@router.get("/{flight_id}", response_model=FlightDetail)
async def get_flight_detail(flight_id: str) -> FlightDetail:
    detail = await flight_detail.build_flight_detail(flight_id)
    if detail is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "FLIGHT_NOT_FOUND", "message": "Zborul nu există."},
        )
    return detail
