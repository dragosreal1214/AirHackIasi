"""Phone authentication endpoints (rate-limited)."""

from fastapi import APIRouter, Request

from app.models.schemas import (
    LoginRequest,
    PhoneStartRequest,
    PhoneStartResponse,
    PhoneVerifyRequest,
    RegisterRequest,
    TokenResponse,
)
from app.rate_limit import limiter
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=PhoneStartResponse)
@limiter.limit("5/hour")
async def register(request: Request, payload: RegisterRequest) -> PhoneStartResponse:
    """Create an account, then verify the phone via OTP (/auth/phone/verify)."""
    return await auth_service.register(payload)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, payload: LoginRequest) -> TokenResponse:
    return await auth_service.login_email(payload)


@router.post("/phone/start", response_model=PhoneStartResponse)
@limiter.limit("5/hour")
async def phone_start(request: Request, payload: PhoneStartRequest) -> PhoneStartResponse:
    return await auth_service.start_phone_verification(payload.phone_number)


@router.post("/phone/verify", response_model=TokenResponse)
@limiter.limit("10/hour")
async def phone_verify(request: Request, payload: PhoneVerifyRequest) -> TokenResponse:
    return await auth_service.verify_otp(payload)
