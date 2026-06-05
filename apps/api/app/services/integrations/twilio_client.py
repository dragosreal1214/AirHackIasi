"""Twilio integration — phone OTP (Verify) + WhatsApp/SMS notifications.

Feature-flagged: with no credentials it runs in DEV mode (logs the action,
accepts the fixed OTP "000000") so the whole auth + notification flow is
testable offline. Set the TWILIO_* env vars to switch to the real service.

The `twilio` package is imported lazily so the API boots without it installed.
"""

from __future__ import annotations

import structlog

from app.config import settings

logger = structlog.get_logger(__name__)

DEV_OTP = "000000"


def _client():  # pragma: no cover - thin wrapper over the SDK
    from twilio.rest import Client

    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


async def healthcheck() -> dict:
    """Validate creds by fetching the Verify service — sends no SMS."""
    if not settings.twilio_enabled:
        return {"enabled": False}
    import asyncio  # noqa: PLC0415

    def _fetch() -> dict:
        svc = (
            _client()
            .verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID)
            .fetch()
        )
        return {"enabled": True, "ok": True, "service": svc.friendly_name}

    try:
        return await asyncio.to_thread(_fetch)
    except Exception as exc:  # noqa: BLE001
        return {"enabled": True, "ok": False, "error": str(exc)}


async def start_verification(phone_number: str) -> None:
    """Send an OTP via Twilio Verify (or log it in dev mode)."""
    if not settings.twilio_enabled:
        logger.info("twilio_dev_verify_start", phone=phone_number, dev_otp=DEV_OTP)
        return
    _client().verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID).verifications.create(
        to=phone_number, channel="sms"
    )
    logger.info("twilio_verify_started", phone=phone_number)


async def check_verification(phone_number: str, code: str) -> bool:
    if not settings.twilio_enabled:
        return code == DEV_OTP
    check = (
        _client()
        .verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID)
        .verification_checks.create(to=phone_number, code=code)
    )
    return check.status == "approved"


async def send_sms(to: str, body: str) -> str | None:
    if not settings.twilio_enabled:
        logger.info("twilio_dev_sms", to=to, body=body)
        return None
    msg = _client().messages.create(to=to, from_=settings.TWILIO_SMS_FROM, body=body)
    return msg.sid


async def send_whatsapp(to: str, body: str) -> str | None:
    if not settings.twilio_enabled:
        logger.info("twilio_dev_whatsapp", to=to, body=body)
        return None
    msg = _client().messages.create(
        to=f"whatsapp:{to}",
        from_=settings.TWILIO_WHATSAPP_FROM,
        body=body,
    )
    return msg.sid
