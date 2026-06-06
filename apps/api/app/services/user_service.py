"""User persistence + auth audit (DB-backed)."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AuthAuditLog, User

DEMO_PHONE = "+40700000000"


async def get_by_id(db: AsyncSession, user_id: str) -> User | None:
    try:
        uid = uuid.UUID(user_id)
    except (ValueError, TypeError):
        return None
    return (await db.execute(select(User).where(User.id == uid))).scalar_one_or_none()


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    return (
        await db.execute(
            select(User).where(User.email == email, User.deleted_at.is_(None))
        )
    ).scalar_one_or_none()


async def get_by_phone(db: AsyncSession, phone_number: str) -> User | None:
    return (
        await db.execute(select(User).where(User.phone_number == phone_number))
    ).scalar_one_or_none()


async def create_registered_user(
    db: AsyncSession,
    *,
    full_name: str,
    email: str,
    phone_number: str,
    password_hash: str,
) -> User:
    user = User(
        full_name=full_name,
        email=email,
        phone_number=phone_number,
        password_hash=password_hash,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_or_create_by_phone(db: AsyncSession, phone_number: str) -> User:
    user = (
        await db.execute(select(User).where(User.phone_number == phone_number))
    ).scalar_one_or_none()
    if user is None:
        user = User(phone_number=phone_number)
        db.add(user)
        await db.flush()
    user.phone_verified_at = datetime.now(timezone.utc)
    user.last_active_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return user


async def get_or_create_demo(db: AsyncSession) -> User:
    return await get_or_create_by_phone(db, DEMO_PHONE)


async def update_profile(
    db: AsyncSession,
    user_id: str,
    *,
    full_name: str | None = None,
    email: str | None = None,
    notification_channels: list[str] | None = None,
) -> User | None:
    user = await get_by_id(db, user_id)
    if user is None:
        return None
    if full_name is not None:
        user.full_name = full_name
    if email is not None:
        user.email = email
    if notification_channels is not None:
        user.notification_channels = notification_channels
    await db.commit()
    await db.refresh(user)
    return user


async def write_audit(
    db: AsyncSession,
    *,
    phone_number: str | None,
    event: str,
    success: bool = True,
    meta: dict | None = None,
) -> None:
    db.add(
        AuthAuditLog(
            phone_number=phone_number, event=event, success=success, meta=meta
        )
    )
    await db.commit()
