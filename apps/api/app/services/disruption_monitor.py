"""Proactive disruption monitor.

Scans active PNRs, computes each flight's fog risk, and dispatches an alert to
any passenger whose flight has newly turned high/critical. Runs on demand
(dev endpoint) and, if MONITOR_INTERVAL_MINUTES > 0, on a background loop.

`force_fog_iata` forces a high reading for flights departing that airport — so
the proactive flow is demonstrable even when the live forecast is calm.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any

import structlog

from app.config import settings
from app.services import flight_service, notification_service, store
from app.services.risk_service import risk_for

logger = structlog.get_logger(__name__)

# Dedupe: passengers already alerted this run-cycle (resets on restart).
_notified: set[str] = set()


@asynccontextmanager
async def _session():
    from sqlalchemy.ext.asyncio import async_sessionmaker  # noqa: PLC0415

    from app.db.base import get_engine  # noqa: PLC0415

    maker = async_sessionmaker(get_engine(), expire_on_commit=False)
    async with maker() as db:
        yield db


async def _active_pnrs() -> list[tuple[str, str, str]]:
    """(phone_number, flight_id, user_id) for every active PNR."""
    if not settings.db_enabled:
        return [("+40700000000", p.flight.id, "demo") for p in store.PNR_STORE if p.status == "active"]

    from sqlalchemy import select  # noqa: PLC0415

    from app.db.models import Pnr, User  # noqa: PLC0415

    async with _session() as db:
        rows = (
            await db.execute(
                select(User.phone_number, Pnr.flight_id, Pnr.user_id)
                .join(Pnr, Pnr.user_id == User.id)
                .where(Pnr.status == "active")
            )
        ).all()
    return [(r[0], r[1], str(r[2])) for r in rows]


async def scan_and_notify(force_fog_iata: str | None = None) -> dict[str, Any]:
    pairs = await _active_pnrs()
    at_risk: list[str] = []
    notified: list[dict[str, Any]] = []

    for phone, flight_id, user_id in pairs:
        flight = flight_service.get_flight(flight_id)
        if flight is None:
            continue
        risk, disruption_id = await risk_for(flight, force_fog_iata)
        if risk.level not in ("high", "critical") or not disruption_id:
            continue
        at_risk.append(flight.flight_number)
        key = f"{user_id}:{flight_id}"
        if key in _notified:
            continue
        result = await notification_service.dispatch(phone, disruption_id)
        _notified.add(key)
        notified.append(
            {"phone": phone, "flight": flight.flight_number, "level": risk.level, "status": result.get("status")}
        )

    logger.info("monitor_scan", scanned=len(pairs), at_risk=len(at_risk), notified=len(notified))
    return {"scanned": len(pairs), "atRisk": at_risk, "notified": notified}


def reset_dedupe() -> None:
    _notified.clear()
