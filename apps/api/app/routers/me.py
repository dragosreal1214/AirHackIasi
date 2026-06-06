"""Current-user profile + notification preferences."""

from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.deps import CurrentUser, get_current_user
from app.models.schemas import Me, UpdateMeRequest

router = APIRouter(prefix="/me", tags=["me"])


@asynccontextmanager
async def _session():
    from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: PLC0415

    from app.db.base import get_engine  # noqa: PLC0415

    maker = async_sessionmaker(get_engine(), expire_on_commit=False)
    async with maker() as db:
        yield db


def _demo_me(user: CurrentUser) -> Me:
    return Me(
        id=user.id,
        full_name="Andrei Pop",
        phone_number=user.phone_number,
        notification_channels=["whatsapp", "sms"],
    )


def _to_me(u) -> Me:
    return Me(
        id=str(u.id),
        full_name=u.full_name,
        email=u.email,
        phone_number=u.phone_number,
        preferred_language=u.preferred_language,
        notification_channels=list(u.notification_channels or []),
    )


@router.get("", response_model=Me)
async def get_me(user: CurrentUser = Depends(get_current_user)) -> Me:
    if not settings.db_enabled:
        return _demo_me(user)
    from app.services import user_service  # noqa: PLC0415

    async with _session() as db:
        u = await user_service.get_by_id(db, user.id)
        if u is None:
            raise HTTPException(status_code=404, detail={"code": "USER_NOT_FOUND", "message": "Cont inexistent."})
        return _to_me(u)


@router.patch("", response_model=Me)
async def update_me(
    payload: UpdateMeRequest,
    user: CurrentUser = Depends(get_current_user),
) -> Me:
    if not settings.db_enabled:
        return _demo_me(user)
    from app.services import user_service  # noqa: PLC0415

    async with _session() as db:
        u = await user_service.update_profile(
            db,
            user.id,
            full_name=payload.full_name,
            notification_channels=payload.notification_channels,
        )
        if u is None:
            raise HTTPException(status_code=404, detail={"code": "USER_NOT_FOUND", "message": "Cont inexistent."})
        return _to_me(u)
