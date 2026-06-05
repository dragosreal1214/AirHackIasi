"""Flight search endpoints."""

from fastapi import APIRouter, Query

from app.models.schemas import FlightSummary
from app.services import flight_service

router = APIRouter(prefix="/flights", tags=["flights"])


@router.get("/search", response_model=list[FlightSummary])
async def search_flights(
    q: str = Query(..., min_length=1),
    date: str | None = Query(None),
) -> list[FlightSummary]:
    return await flight_service.search_flights(q, date)
