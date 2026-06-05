"""Dev/demo-only endpoints. Mounted only when DEBUG is on."""

from typing import Any

from fastapi import APIRouter

from app.config import settings
from app.models.schemas import TestNotificationRequest
from app.services import notification_service
from app.services.integrations import orange_client

router = APIRouter(prefix="/dev", tags=["dev"])


@router.get("/db/status")
async def db_status() -> dict[str, Any]:
    """Verify the database connection (does not expose the URL)."""
    if not settings.db_enabled:
        return {"enabled": False}
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine

        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
        return {"enabled": True, "connected": True}
    except Exception as exc:  # noqa: BLE001
        return {"enabled": True, "connected": False, "error": str(exc)}


@router.post("/send-notification")
async def send_test_notification(payload: TestNotificationRequest) -> dict[str, str]:
    """Render + 'send' a fog alert. In dev mode the message is logged, not sent."""
    return await notification_service.dispatch(
        payload.phone_number, payload.disruption_id
    )


@router.get("/orange/status")
async def orange_status() -> dict[str, Any]:
    """Check Orange creds + OAuth token (does not expose the token)."""
    return await orange_client.orange_client.healthcheck()


@router.get("/orange/sim-swap")
async def orange_sim_swap(phone: str) -> dict[str, Any]:
    """Try a SIM Swap check. `swapped` is null until the subscription is approved.

    Sandbox test numbers: +40789103050..+40789103053.
    """
    return {"swapped": await orange_client.orange_client.check_sim_swap(phone)}


@router.get("/orange/kyc-match")
async def orange_kyc_match(phone: str) -> dict[str, Any]:
    """Run KYC Match for a sandbox number using its known lab identity.

    For +4078910305x the matching identity is used, so you should see all
    fields match. `result` is null until Orange is configured/approved.
    """
    applicant = orange_client.SANDBOX_IDENTITIES.get(phone, {})
    result = await orange_client.orange_client.kyc_match(phone, applicant)
    return {"applicant": applicant, "result": result}
