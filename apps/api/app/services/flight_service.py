"""Flight search over the real LRIA weekly schedule.

Expands the recurring schedule (app/data/lria_schedule.py) into concrete
flights for a chosen date and supports search by flight number / city / IATA.
Also resolves a flight id back to its summary (used when adding a PNR).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.data.lria_schedule import WEEKLY, airline_name
from app.ml import airports as registry
from app.models.schemas import FlightSummary
from app.services import store

_OFFSET = "+03:00"  # Europe/Bucharest (EEST, June)


def _fmt_no(no: str) -> str:
    return f"{no[:2]} {no[2:]}"


def _summary(no: str, direction: str, other: str, time: str, date: str) -> FlightSummary:
    dep = datetime.fromisoformat(f"{date}T{time}:00{_OFFSET}")
    arr = dep + timedelta(hours=2)
    a = registry.get(other)
    other_city = a.city if a else other
    if direction == "D":
        o_iata, o_city, d_iata, d_city = "IAS", "Iași", other, other_city
    else:
        o_iata, o_city, d_iata, d_city = other, other_city, "IAS", "Iași"
    return FlightSummary(
        id=f"{no}-{date}",
        flight_number=_fmt_no(no),
        airline_code=no[:2],
        airline_name=airline_name(no),
        origin_iata=o_iata,
        origin_city=o_city,
        destination_iata=d_iata,
        destination_city=d_city,
        scheduled_departure=dep.isoformat(),
        scheduled_arrival=arr.isoformat(),
        status="scheduled",
    )


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _matches(no: str, other: str, q: str) -> bool:
    a = registry.get(other)
    hay = [_fmt_no(no).lower().replace(" ", ""), no.lower(), other.lower()]
    if a:
        hay.append(a.city.lower())
    return any(q in h for h in hay)


def _matches_place(iata: str, city: str, term: str) -> bool:
    t = term.strip().lower()
    return t in iata.lower() or t in city.lower()


async def search_flights(
    query: str | None = None,
    date: str | None = None,
    origin: str | None = None,
    destination: str | None = None,
) -> list[FlightSummary]:
    """Search by flight number/city (query) and/or by route (origin/destination)
    on a given date. At least one filter must be provided."""
    q = "".join((query or "").lower().split())
    if not q and not origin and not destination:
        return []
    day = date or _today()
    results: list[FlightSummary] = []
    for (no, direction, other, time) in WEEKLY:
        s = _summary(no, direction, other, time, day)
        if q and not _matches(no, other, q):
            continue
        if origin and not _matches_place(s.origin_iata, s.origin_city, origin):
            continue
        if destination and not _matches_place(
            s.destination_iata, s.destination_city, destination
        ):
            continue
        results.append(s)
    results.sort(key=lambda f: f.scheduled_departure)
    return results[:40]


def flights_between(
    origin_iata: str, dest_iata: str, after_iso: str, within_hours: int = 30
) -> list[FlightSummary]:
    """Scheduled flights on the same O-D pair departing after `after_iso`."""
    after = datetime.fromisoformat(after_iso)
    end = after + timedelta(hours=within_hours)
    results: list[FlightSummary] = []
    for day_offset in range((within_hours // 24) + 2):
        date = (after.date() + timedelta(days=day_offset)).isoformat()
        for (no, direction, other, time) in WEEKLY:
            s = _summary(no, direction, other, time, date)
            if s.origin_iata == origin_iata and s.destination_iata == dest_iata:
                dep = datetime.fromisoformat(s.scheduled_departure)
                if after < dep <= end:
                    results.append(s)
    results.sort(key=lambda f: f.scheduled_departure)
    return results


def get_flight(flight_id: str) -> FlightSummary | None:
    # Curated demo flights (e.g. the fog-disruption scenario) come first.
    for f in store.FLIGHT_CATALOG:
        if f.id == flight_id:
            return f
    # Schedule flights are "<flight_number>-<YYYY-MM-DD>".
    no, sep, date = flight_id.partition("-")
    if not sep or len(date) != 10:
        return None
    for (n, direction, other, time) in WEEKLY:
        if n == no:
            return _summary(n, direction, other, time, date)
    return None
