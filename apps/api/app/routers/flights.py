"""Flight search endpoints."""

from fastapi import APIRouter, Query

from app.models.schemas import FlightSummary
from app.services import flight_service

router = APIRouter(prefix="/flights", tags=["flights"])


@router.get("/search", response_model=list[FlightSummary])
async def search_flights(
    q: str | None = Query(None, description="flight number or city"),
    date: str | None = Query(None, description="YYYY-MM-DD"),
    origin: str | None = Query(None, description="from (IATA or city)"),
    destination: str | None = Query(None, description="to (IATA or city)"),
) -> list[FlightSummary]:
    return await flight_service.search_flights(q, date, origin, destination)
