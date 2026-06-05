"""Phone authentication.

Flow: start (SMS OTP via Twilio) -> verify -> JWT tokens.
Orange Number Verification is NOT available in Romania, so login is SMS OTP.
On successful verification we run an Orange **SIM Swap** check as an
account-takeover signal (non-blocking) and persist the user + an audit entry.

DEV mode (no Twilio): the OTP is the fixed "000000".
"""

from __future__ import annotations

import secrets
from contextlib import asynccontextmanager

import structlog
from fastapi import HTTPException

from app.config import settings
from app.models.schemas import PhoneStartResponse, PhoneVerifyRequest, TokenResponse
from app.services import jwt_service
from app.services.integrations import orange_client, twilio_client

logger = structlog.get_logger(__name__)

# challenge_id -> {phone, method}
_CHALLENGES: dict[str, dict[str, str]] = {}


@asynccontextmanager
async def _session():
    """Yield a DB session in DB mode, or None when running in-memory."""
    if not settings.db_enabled:
        yield None
        return
    from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: PLC0415

    from app.db.base import get_engine  # noqa: PLC0415

    maker = async_sessionmaker(get_engine(), expire_on_commit=False)
    async with maker() as db:
        yield db


async def _audit(db, *, phone: str | None, event: str, success: bool = True) -> None:
    if db is None:
        return
    from app.services import user_service  # noqa: PLC0415

    await user_service.write_audit(db, phone_number=phone, event=event, success=success)


async def start_phone_verification(phone_number: str) -> PhoneStartResponse:
    challenge_id = secrets.token_urlsafe(16)
    await twilio_client.start_verification(phone_number)
    method = "sms_otp" if settings.twilio_enabled else "dev"
    _CHALLENGES[challenge_id] = {"phone": phone_number, "method": method}
    async with _session() as db:
        await _audit(db, phone=phone_number, event="otp_started")
    return PhoneStartResponse(challenge_id=challenge_id, method=method)


async def verify_otp(payload: PhoneVerifyRequest) -> TokenResponse:
    challenge = _CHALLENGES.get(payload.challenge_id)
    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "CHALLENGE_NOT_FOUND", "message": "Sesiune expirată."},
        )
    phone = challenge["phone"]

    ok = await twilio_client.check_verification(phone, payload.code or "")
    if not ok:
        async with _session() as db:
            await _audit(db, phone=phone, event="otp_failed", success=False)
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_OTP", "message": "Cod greșit. Mai încearcă."},
        )

    # Account-takeover signal: was the SIM swapped recently? (non-blocking)
    swapped = await orange_client.orange_client.check_sim_swap(phone)
    if swapped:
        logger.warning("login_sim_swap_detected", phone=phone)

    _CHALLENGES.pop(payload.challenge_id, None)

    async with _session() as db:
        if db is not None:
            from app.services import user_service  # noqa: PLC0415

            user = await user_service.get_or_create_by_phone(db, phone)
            subject = str(user.id)
            await _audit(
                db, phone=phone, event="login_success", success=not bool(swapped)
            )
        else:
            subject = phone  # in-memory mode

    return TokenResponse(
        access_token=jwt_service.create_access_token(subject),
        refresh_token=jwt_service.create_refresh_token(subject),
    )
