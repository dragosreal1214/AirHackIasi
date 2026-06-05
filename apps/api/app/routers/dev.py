"""Dev/demo-only endpoints. Mounted only when DEBUG is on."""

from fastapi import APIRouter

from app.models.schemas import TestNotificationRequest
from app.services import notification_service

router = APIRouter(prefix="/dev", tags=["dev"])


@router.post("/send-notification")
async def send_test_notification(payload: TestNotificationRequest) -> dict[str, str]:
    """Render + 'send' a fog alert. In dev mode the message is logged, not sent."""
    return await notification_service.dispatch(
        payload.phone_number, payload.disruption_id
    )
