"""Shared FastAPI dependencies."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException, Request

from app.config import settings
from app.services import jwt_service


@dataclass(frozen=True)
class CurrentUser:
    id: str
    phone_number: str


_UNAUTHORIZED = HTTPException(
    status_code=401,
    detail={"code": "UNAUTHORIZED", "message": "Autentificare necesară."},
)


def _bearer(request: Request) -> str | None:
    header = request.headers.get("Authorization", "")
    if header.lower().startswith("bearer "):
        return header[7:].strip()
    return None


async def get_current_user(request: Request) -> CurrentUser:
    """Resolve the authenticated user.

    - Valid Bearer token -> the real user (DB-backed when configured).
    - No token + DEBUG    -> a demo user (keeps the local demo usable).
    - No token in prod    -> 401.
    """
    token = _bearer(request)

    if not settings.db_enabled:
        # In-memory mode: a single demo identity, token optional.
        return CurrentUser(id="demo-user", phone_number="+40700000000")

    from app.db.base import get_engine  # noqa: PLC0415
    from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: PLC0415

    from app.services import user_service  # noqa: PLC0415

    get_engine()
    Session = async_sessionmaker(get_engine(), expire_on_commit=False)

    async with Session() as db:
        if token:
            user_id = jwt_service.decode_token(token, "access")
            if not user_id:
                raise _UNAUTHORIZED
            user = await user_service.get_by_id(db, user_id)
            if user is None or user.deleted_at is not None:
                raise _UNAUTHORIZED
            return CurrentUser(id=str(user.id), phone_number=user.phone_number)

        if settings.DEBUG:
            user = await user_service.get_or_create_demo(db)
            return CurrentUser(id=str(user.id), phone_number=user.phone_number)

        raise _UNAUTHORIZED
