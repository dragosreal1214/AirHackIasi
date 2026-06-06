"""Alternatives engine + derived disruptions."""

import pytest

from app.services import alternatives_service, flight_service


@pytest.mark.asyncio
async def test_alternatives_ranked_for_ias_otp() -> None:
    flights = await flight_service.search_flights("RO702")  # IAS -> OTP
    assert flights
    alts = alternatives_service.generate_alternatives(flights[0])
    assert len(alts) >= 1
    assert alts[0].rank == 1
    # Ranked by score descending.
    assert all(alts[i].score >= alts[i + 1].score for i in range(len(alts) - 1))
    # Domestic route should surface a later flight and/or a train.
    assert {"alternate_flight", "train"} & {a.type for a in alts}


@pytest.mark.asyncio
async def test_derived_disruption_and_alternatives() -> None:
    flights = await flight_service.search_flights("RO702")
    fid = flights[0].id
    d = await alternatives_service.get_disruption(f"d_{fid}")
    assert d.flight.id == fid
    assert d.alternatives_count >= 1
    alts = await alternatives_service.get_alternatives(f"d_{fid}")
    assert len(alts) == d.alternatives_count


@pytest.mark.asyncio
async def test_unknown_disruption_404() -> None:
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        await alternatives_service.get_disruption("nope")
