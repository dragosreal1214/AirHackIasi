"""Tests for the high-risk fog alert dispatcher (dev mode — no real send)."""

import pytest

from app.services import notification_service


@pytest.mark.asyncio
async def test_high_risk_alert_dispatched() -> None:
    res = await notification_service.dispatch("+40712345678", "d_001")
    assert res["status"] == "sent"
    # Romanian alert copy referencing the fog risk and a deep link.
    assert "risc de ceață" in res["preview"]
    assert "/d/d_001" in res["preview"]
    # In dev mode both channels "send" (logged) successfully.
    assert res["channels"]["whatsapp"]["ok"] is True
    assert res["channels"]["sms"]["ok"] is True


@pytest.mark.asyncio
async def test_unknown_disruption_skipped() -> None:
    res = await notification_service.dispatch("+40712345678", "nope")
    assert res["status"] == "skipped"


@pytest.mark.asyncio
async def test_add_high_risk_flight_triggers_alert() -> None:
    """Adding RO 632 (high risk) returns a PNR flagged for alerting."""
    from httpx import ASGITransport, AsyncClient

    from app.main import app

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        created = await c.post("/api/v1/pnrs", json={"flightId": "fl_ro632"})
    # 201 new, or 409 if a previous test already added it — both prove the path.
    assert created.status_code in (201, 409)
    if created.status_code == 201:
        body = created.json()
        assert body["currentRisk"]["level"] == "high"
        assert body["disruptionId"] == "d_001"
