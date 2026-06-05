"""Dev/demo-only endpoints. Mounted only when DEBUG is on."""

from typing import Any

from fastapi import APIRouter

from app.models.schemas import TestNotificationRequest
from app.services import notification_service
from app.services.integrations import orange_client

router = APIRouter(prefix="/dev", tags=["dev"])


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
    """Try a SIM Swap check. `swapped` is null until the subscription is approved."""
    return {"swapped": await orange_client.orange_client.check_sim_swap(phone)}
