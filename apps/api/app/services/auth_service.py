"""Phone authentication.

Flow: start (SMS OTP via Twilio) -> verify -> tokens.
Orange Number Verification is NOT available in Romania, so login is SMS OTP.
On successful verification we run an Orange **SIM Swap** check as an
account-takeover signal (non-blocking: logged, surfaced for later policy).

With no credentials this runs in DEV mode: the OTP is the fixed "000000" and a
signed dev token is returned. Tokens are not yet enforced on data endpoints
(passenger onboarding screen is a later task) — this lays the groundwork.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets

import structlog
from fastapi import HTTPException

from app.config import settings
from app.models.schemas import (
    PhoneStartResponse,
    PhoneVerifyRequest,
    TokenResponse,
)
from app.services.integrations import orange_client, twilio_client

logger = structlog.get_logger(__name__)

# challenge_id -> {phone, method}
_CHALLENGES: dict[str, dict[str, str]] = {}


def _sign(value: str) -> str:
    sig = hmac.new(settings.JWT_SECRET.encode(), value.encode(), hashlib.sha256)
    return f"{value}.{sig.hexdigest()[:32]}"


async def start_phone_verification(phone_number: str) -> PhoneStartResponse:
    challenge_id = secrets.token_urlsafe(16)
    await twilio_client.start_verification(phone_number)
    method = "sms_otp" if settings.twilio_enabled else "dev"
    _CHALLENGES[challenge_id] = {"phone": phone_number, "method": method}
    return PhoneStartResponse(challenge_id=challenge_id, method=method)


async def verify_otp(payload: PhoneVerifyRequest) -> TokenResponse:
    challenge = _CHALLENGES.get(payload.challenge_id)
    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "CHALLENGE_NOT_FOUND", "message": "Sesiune expirată."},
        )

    ok = await twilio_client.check_verification(challenge["phone"], payload.code or "")
    if not ok:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_OTP", "message": "Cod greșit. Mai încearcă."},
        )

    # Account-takeover signal: was the SIM swapped recently? (non-blocking)
    swapped = await orange_client.orange_client.check_sim_swap(challenge["phone"])
    if swapped:
        logger.warning("login_sim_swap_detected", phone=challenge["phone"])

    _CHALLENGES.pop(payload.challenge_id, None)
    subject = challenge["phone"]
    return TokenResponse(
        access_token=_sign(f"access:{subject}"),
        refresh_token=_sign(f"refresh:{subject}"),
    )
