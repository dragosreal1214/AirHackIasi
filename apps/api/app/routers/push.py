"""Web Push subscription endpoints."""

from typing import Any

from fastapi import APIRouter, Depends

from app.config import settings
from app.deps import CurrentUser, get_current_user
from app.services import push_service

router = APIRouter(prefix="/push", tags=["push"])


@router.get("/public-key")
async def public_key() -> dict[str, Any]:
    """VAPID public key the browser needs to subscribe (empty if push is off)."""
    return {"publicKey": settings.VAPID_PUBLIC_KEY, "enabled": settings.push_enabled}


@router.post("/subscribe", status_code=201)
async def subscribe(
    subscription: dict[str, Any],
    user: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    ok = await push_service.save_subscription(user.id, subscription)
    return {"saved": ok}
