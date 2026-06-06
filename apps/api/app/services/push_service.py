"""Web Push (VAPID) — store browser subscriptions + send push notifications.

Lets the PWA receive native pop-up notifications (in addition to WhatsApp/SMS).
Subscriptions are per-user; dead endpoints (404/410) are pruned on send.
"""

from __future__ import annotations

import asyncio
import json
import uuid as _uuid
from contextlib import asynccontextmanager

import structlog

from app.config import settings

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def _session():
    from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: PLC0415

    from app.db.base import get_engine  # noqa: PLC0415

    maker = async_sessionmaker(get_engine(), expire_on_commit=False)
    async with maker() as db:
        yield db


async def save_subscription(user_id: str, sub: dict) -> bool:
    """Persist a PushSubscription (browser PushManager subscription JSON)."""
    if not settings.db_enabled:
        return False
    endpoint = sub.get("endpoint")
    keys = sub.get("keys") or {}
    p256dh, auth = keys.get("p256dh"), keys.get("auth")
    if not (endpoint and p256dh and auth):
        return False
    try:
        uid = _uuid.UUID(user_id)
    except (ValueError, TypeError):
        return False

    from sqlalchemy import select  # noqa: PLC0415

    from app.db.models import PushSubscription  # noqa: PLC0415

    async with _session() as db:
        existing = (
            await db.execute(
                select(PushSubscription).where(PushSubscription.endpoint == endpoint)
            )
        ).scalar_one_or_none()
        if existing is not None:
            existing.user_id = uid
            existing.p256dh = p256dh
            existing.auth = auth
        else:
            db.add(
                PushSubscription(user_id=uid, endpoint=endpoint, p256dh=p256dh, auth=auth)
            )
        await db.commit()
    return True


def _send_one(sub_info: dict, payload: str) -> None:
    from pywebpush import webpush  # noqa: PLC0415

    webpush(
        subscription_info=sub_info,
        data=payload,
        vapid_private_key=settings.VAPID_PRIVATE_KEY,
        vapid_claims={"sub": settings.VAPID_SUBJECT},
        timeout=10,
    )


async def send_to_phone(phone_number: str, title: str, body: str, url: str = "/") -> int:
    """Push to every subscription of the user with this phone. Returns count sent."""
    if not (settings.push_enabled and settings.db_enabled):
        return 0

    from sqlalchemy import delete, select  # noqa: PLC0415

    from app.db.models import PushSubscription, User  # noqa: PLC0415

    payload = json.dumps({"title": title, "body": body, "url": url})
    sent, dead = 0, []
    async with _session() as db:
        uid = (
            await db.execute(select(User.id).where(User.phone_number == phone_number))
        ).scalar_one_or_none()
        if uid is None:
            return 0
        subs = (
            await db.execute(
                select(PushSubscription).where(PushSubscription.user_id == uid)
            )
        ).scalars().all()
        for s in subs:
            info = {"endpoint": s.endpoint, "keys": {"p256dh": s.p256dh, "auth": s.auth}}
            try:
                await asyncio.to_thread(_send_one, info, payload)
                sent += 1
            except Exception as exc:  # noqa: BLE001
                msg = str(exc)
                if "410" in msg or "404" in msg:
                    dead.append(s.endpoint)
                logger.warning("webpush_failed", error=msg[:160])
        if dead:
            await db.execute(
                delete(PushSubscription).where(PushSubscription.endpoint.in_(dead))
            )
            await db.commit()
    return sent
