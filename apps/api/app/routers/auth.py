"""Phone authentication endpoints."""

from fastapi import APIRouter

from app.models.schemas import (
    PhoneStartRequest,
    PhoneStartResponse,
    PhoneVerifyRequest,
    TokenResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/phone/start", response_model=PhoneStartResponse)
async def phone_start(payload: PhoneStartRequest) -> PhoneStartResponse:
    return await auth_service.start_phone_verification(payload.phone_number)


@router.post("/phone/verify", response_model=TokenResponse)
async def phone_verify(payload: PhoneVerifyRequest) -> TokenResponse:
    return await auth_service.verify_otp(payload)
