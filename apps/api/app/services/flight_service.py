"""Flight search business logic.

In-memory catalog today; will query the `flights` table (and AeroDataBox for
live schedules) once the database and RapidAPI key are configured.
"""

from app.models.schemas import FlightSummary
from app.services import store


async def search_flights(query: str, date: str | None = None) -> list[FlightSummary]:
    q = "".join(query.lower().split())
    if not q:
        return []
    return [
        f
        for f in store.FLIGHT_CATALOG
        if q in "".join(f.flight_number.lower().split())
    ]
