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
from app.models.schemas import (
    LoginRequest,
    PhoneStartResponse,
    PhoneVerifyRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services import jwt_service, password
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


def _require_db() -> None:
    if not settings.db_enabled:
        raise HTTPException(
            status_code=503,
            detail={"code": "DB_REQUIRED", "message": "Înregistrarea necesită baza de date."},
        )


async def register(payload: RegisterRequest) -> PhoneStartResponse:
    """Create an account (name/email/phone/password), then start phone OTP."""
    _require_db()
    if len(payload.password) < 8:
        raise HTTPException(
            status_code=400,
            detail={"code": "WEAK_PASSWORD", "message": "Parola trebuie să aibă minim 8 caractere."},
        )
    from app.services import user_service  # noqa: PLC0415

    async with _session() as db:
        if await user_service.get_by_email(db, payload.email):
            raise HTTPException(
                status_code=409,
                detail={"code": "EMAIL_TAKEN", "message": "Există deja un cont cu acest email."},
            )
        if await user_service.get_by_phone(db, payload.phone_number):
            raise HTTPException(
                status_code=409,
                detail={"code": "PHONE_TAKEN", "message": "Există deja un cont cu acest număr."},
            )
        await user_service.create_registered_user(
            db,
            full_name=payload.full_name,
            email=payload.email,
            phone_number=payload.phone_number,
            password_hash=password.hash_password(payload.password),
        )
        await _audit(db, phone=payload.phone_number, event="register")

    challenge_id = secrets.token_urlsafe(16)
    await twilio_client.start_verification(payload.phone_number)
    method = "sms_otp" if settings.twilio_enabled else "dev"
    _CHALLENGES[challenge_id] = {"phone": payload.phone_number, "method": method}
    return PhoneStartResponse(challenge_id=challenge_id, method=method)


async def refresh_tokens(refresh_token: str) -> TokenResponse:
    """Exchange a valid refresh token for a fresh access + refresh pair."""
    subject = jwt_service.decode_token(refresh_token, "refresh")
    if subject is None:
        raise HTTPException(
            status_code=401,
            detail={"code": "INVALID_REFRESH", "message": "Sesiune expirată. Autentifică-te din nou."},
        )
    # In DB mode, make sure the user still exists / isn't deleted.
    if settings.db_enabled and subject != "demo-user":
        async with _session() as db:
            if db is not None:
                from app.services import user_service  # noqa: PLC0415

                user = await user_service.get_by_id(db, subject)
                if user is None or user.deleted_at is not None:
                    raise HTTPException(
                        status_code=401,
                        detail={"code": "INVALID_REFRESH", "message": "Cont inexistent."},
                    )
    return TokenResponse(
        access_token=jwt_service.create_access_token(subject),
        refresh_token=jwt_service.create_refresh_token(subject),
    )


async def login_email(payload: LoginRequest) -> TokenResponse:
    """Email + password login."""
    _require_db()
    from app.services import user_service  # noqa: PLC0415

    async with _session() as db:
        user = await user_service.get_by_email(db, payload.email)
        if (
            user is None
            or not user.password_hash
            or not password.verify_password(payload.password, user.password_hash)
        ):
            await _audit(db, phone=None, event="login_failed", success=False)
            raise HTTPException(
                status_code=401,
                detail={"code": "INVALID_CREDENTIALS", "message": "Email sau parolă greșite."},
            )
        await _audit(db, phone=user.phone_number, event="login_success")
        subject = str(user.id)

    return TokenResponse(
        access_token=jwt_service.create_access_token(subject),
        refresh_token=jwt_service.create_refresh_token(subject),
    )


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
