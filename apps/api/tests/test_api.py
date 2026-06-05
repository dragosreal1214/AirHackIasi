"""Smoke tests for the v1 API (in-memory mode, no credentials)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://test"
V1 = "/api/v1"


def _client() -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url=BASE)


@pytest.mark.asyncio
async def test_list_pnrs() -> None:
    async with _client() as c:
        resp = await c.get(f"{V1}/pnrs?status=active")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    # camelCase contract
    assert "flightNumber" in data[0]["flight"]
    assert data[0]["flight"]["originIata"] == "IAS"


@pytest.mark.asyncio
async def test_flight_search_real_schedule() -> None:
    async with _client() as c:
        found = await c.get(f"{V1}/flights/search?q=LTN")
    assert found.status_code == 200
    body = found.json()
    assert len(body) >= 1
    # Real London-Luton route on the LRIA schedule.
    assert any(f["destinationIata"] == "LTN" or f["originIata"] == "LTN" for f in body)


@pytest.mark.asyncio
async def test_add_then_duplicate() -> None:
    async with _client() as c:
        found = await c.get(f"{V1}/flights/search?q=LTN")
        flight_id = found.json()[0]["id"]

        created = await c.post(f"{V1}/pnrs", json={"flightId": flight_id})
        assert created.status_code == 201
        assert created.json()["flight"]["id"] == flight_id

        dup = await c.post(f"{V1}/pnrs", json={"flightId": flight_id})
        assert dup.status_code == 409
        assert dup.json()["detail"]["code"] == "PNR_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_disruption_and_alternatives() -> None:
    async with _client() as c:
        d = await c.get(f"{V1}/disruptions/d_001")
        assert d.status_code == 200
        assert d.json()["risk"]["level"] == "high"

        alts = await c.get(f"{V1}/disruptions/d_001/alternatives")
        assert alts.status_code == 200
        body = alts.json()
        assert len(body) == 4
        assert body[0]["rank"] == 1  # recommended first

        sel = await c.post(f"{V1}/alternatives/{body[0]['id']}/select")
        assert sel.status_code == 204


@pytest.mark.asyncio
async def test_auth_dev_flow() -> None:
    async with _client() as c:
        start = await c.post(
            f"{V1}/auth/phone/start", json={"phoneNumber": "+40712345678"}
        )
        assert start.status_code == 200
        assert start.json()["method"] == "dev"
        challenge = start.json()["challengeId"]

        bad = await c.post(
            f"{V1}/auth/phone/verify",
            json={"challengeId": challenge, "code": "999999"},
        )
        assert bad.status_code == 400

        ok = await c.post(
            f"{V1}/auth/phone/verify",
            json={"challengeId": challenge, "code": "000000"},
        )
        assert ok.status_code == 200
        assert ok.json()["accessToken"]
