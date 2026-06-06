"""Disruptions + alternatives engine.

A disruption is a derived view over a flight + its current fog risk. For the
curated demo it's served from the in-memory store; for any real flagged flight
it's computed live, and alternatives are generated from the actual schedule
(later flights on the same route) plus static train/bus options, then scored.

Scoring (per spec): 0.40·time + 0.30·reliability + 0.20·cost + 0.10·convenience.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.data import ground_transport
from app.models.schemas import Alternative, Disruption
from app.services import flight_service, store
from app.services.risk_service import risk_for

_AIRLINE_BOOKING = {
    "W4": "https://wizzair.com/",
    "RO": "https://www.tarom.ro/",
    "FR": "https://www.ryanair.com/",
    "OS": "https://www.austrian.com/",
    "A2": "https://www.animawings.com/",
    "H4": "https://www.hisky.aero/",
}


def _minutes(start_iso: str, end_iso: str) -> int:
    return int((datetime.fromisoformat(end_iso) - datetime.fromisoformat(start_iso)).total_seconds() // 60)


def _hours_lost(orig_dep_iso: str, alt_dep_iso: str) -> float:
    return max(0.0, (datetime.fromisoformat(alt_dep_iso) - datetime.fromisoformat(orig_dep_iso)).total_seconds() / 3600)


def _score(*, hours_lost: float, reliability: float, cost: float) -> float:
    time_score = max(0.0, 100 - 8 * hours_lost)
    cost_score = max(0.0, 100 - cost / 2)
    convenience = 80.0
    return round(0.40 * time_score + 0.30 * reliability * 100 + 0.20 * cost_score + 0.10 * convenience, 1)


def generate_alternatives(flight) -> list[Alternative]:
    raw: list[Alternative] = []

    # 1. Later flights on the same route (real schedule).
    for i, f in enumerate(
        flight_service.flights_between(
            flight.origin_iata, flight.destination_iata, flight.scheduled_departure
        )
    ):
        cost = 95.0
        rel = 0.85
        raw.append(
            Alternative(
                id=f"alt_flight_{i}",
                rank=0,
                type="alternate_flight",
                title=f"{f.airline_name} {f.flight_number} · {f.origin_iata} → {f.destination_iata}",
                subtitle="Zbor alternativ mai târziu, același traseu",
                departure=f.scheduled_departure,
                arrival=f.scheduled_arrival,
                duration_minutes=_minutes(f.scheduled_departure, f.scheduled_arrival),
                cost_eur=cost,
                reliability=rel,
                score=_score(
                    hours_lost=_hours_lost(flight.scheduled_departure, f.scheduled_departure),
                    reliability=rel,
                    cost=cost,
                ),
                action_url=_AIRLINE_BOOKING.get(f.airline_code, "https://www.google.com/travel/flights"),
                action_label=f"Rezervă pe {f.airline_name}",
            )
        )

    # 2. Train + bus (static, only on known city pairs).
    for mode, opts, label in (
        ("train", ground_transport.trains(flight.origin_city, flight.destination_city), "tren"),
        ("bus", ground_transport.buses(flight.origin_city, flight.destination_city), "autocar"),
    ):
        for j, o in enumerate(opts):
            dep = datetime.fromisoformat(flight.scheduled_departure) + timedelta(minutes=o["offset"])
            arr = dep + timedelta(minutes=o["duration"])
            raw.append(
                Alternative(
                    id=f"alt_{mode}_{j}",
                    rank=0,
                    type=mode,  # type: ignore[arg-type]
                    title=f"{o['provider']} {o['number']} · {flight.origin_city} → {flight.destination_city}",
                    subtitle="Direct, fără transfer la aeroport"
                    if mode == "train"
                    else "Plecare din centru, fără aeroport",
                    departure=dep.isoformat(),
                    arrival=arr.isoformat(),
                    duration_minutes=o["duration"],
                    cost_eur=float(o["price"]),
                    reliability=o["reliability"],
                    score=_score(
                        hours_lost=_hours_lost(flight.scheduled_departure, dep.isoformat()),
                        reliability=o["reliability"],
                        cost=float(o["price"]),
                    ),
                    action_url=o["url"],
                    action_label=f"Rezervă {label} pe {o['provider']}",
                )
            )

    raw.sort(key=lambda a: a.score, reverse=True)
    for i, a in enumerate(raw):
        a.rank = i + 1
    return raw[:6]


async def get_disruption(disruption_id: str) -> Disruption:
    if disruption_id in store.DISRUPTIONS:
        return store.DISRUPTIONS[disruption_id]
    if not disruption_id.startswith("d_"):
        raise HTTPException(
            status_code=404,
            detail={"code": "DISRUPTION_NOT_FOUND", "message": "Alertă inexistentă."},
        )
    flight = flight_service.get_flight(disruption_id[2:])
    if flight is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "DISRUPTION_NOT_FOUND", "message": "Alertă inexistentă."},
        )
    risk, _ = await risk_for(flight)
    alts = generate_alternatives(flight)
    return Disruption(
        id=disruption_id,
        flight=flight,
        severity=risk.level,
        risk=risk,
        detected_at=datetime.now(timezone.utc).isoformat(),
        alternatives_count=len(alts),
    )


async def get_alternatives(disruption_id: str) -> list[Alternative]:
    if disruption_id in store.ALTERNATIVES:
        return sorted(store.ALTERNATIVES[disruption_id], key=lambda a: a.rank)
    if not disruption_id.startswith("d_"):
        raise HTTPException(
            status_code=404,
            detail={"code": "DISRUPTION_NOT_FOUND", "message": "Alertă inexistentă."},
        )
    flight = flight_service.get_flight(disruption_id[2:])
    if flight is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "DISRUPTION_NOT_FOUND", "message": "Alertă inexistentă."},
        )
    return generate_alternatives(flight)


async def select_alternative(alternative_id: str) -> None:
    # Records the user's choice. No-op for now (no persistence layer yet).
    return None
