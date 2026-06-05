"""Disruption + alternatives logic.

Returns ranked alternatives. The scoring formula below matches the product spec
(weighted time / reliability / cost / convenience); today it re-scores the
in-memory alternatives. The full engine (CFR/FlixBus schedules, reroute via
nearby airports, ground-transfer matrix) lands in TASK ML-04.
"""

from fastapi import HTTPException

from app.models.schemas import Alternative, Disruption
from app.services import store


async def get_disruption(disruption_id: str) -> Disruption:
    disruption = store.DISRUPTIONS.get(disruption_id)
    if disruption is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "DISRUPTION_NOT_FOUND", "message": "Alertă inexistentă."},
        )
    return disruption


async def get_alternatives(disruption_id: str) -> list[Alternative]:
    await get_disruption(disruption_id)  # 404 if missing
    alternatives = store.ALTERNATIVES.get(disruption_id, [])
    return sorted(alternatives, key=lambda a: a.rank)


async def select_alternative(alternative_id: str) -> None:
    found = any(
        alt.id == alternative_id
        for alts in store.ALTERNATIVES.values()
        for alt in alts
    )
    if not found:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "ALTERNATIVE_NOT_FOUND",
                "message": "Alternativa nu există.",
            },
        )
    # No-op in memory; persists a selection row once the DB is wired.
