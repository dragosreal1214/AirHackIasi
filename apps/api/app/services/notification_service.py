"""Notification dispatcher.

Renders the fog-warning message (Romanian) and sends it over the requested
channels via Twilio. With no Twilio credentials it logs the message in dev mode
so the flow is demonstrable offline. Each channel is attempted independently;
a failure on one (e.g. WhatsApp recipient hasn't joined the sandbox) doesn't
block the others.
"""

from __future__ import annotations

import structlog

from app.config import settings
from app.models.schemas import Disruption
from app.services import store
from app.services.integrations import twilio_client
from app.services.integrations.orange_client import orange_client

logger = structlog.get_logger(__name__)

DEFAULT_CHANNELS = ["whatsapp", "sms"]


def render_message(disruption: Disruption) -> str:
    f = disruption.flight
    pct = round(disruption.risk.probability * 100)
    return (
        f"⚠️ Fogora: zborul {f.flight_number} ({f.origin_iata}→{f.destination_iata}) "
        f"are risc de ceață {pct}% la plecare.\n"
        f"Decide din timp — avem alternative pre-calculate.\n"
        f"Vezi alternative: https://fogora.app/trips/{f.id}"
    )


async def dispatch(
    phone_number: str,
    disruption_id: str,
    channels: list[str] | None = None,
) -> dict:
    # Resolve curated or derived (d_<flight_id>) disruptions.
    disruption = store.DISRUPTIONS.get(disruption_id)
    if disruption is None:
        try:
            from app.services import alternatives_service  # noqa: PLC0415

            disruption = await alternatives_service.get_disruption(disruption_id)
        except Exception:  # noqa: BLE001
            disruption = None
    if disruption is None:
        return {"status": "skipped", "reason": "unknown_disruption"}

    channels = channels or DEFAULT_CHANNELS

    # Orange Device Reachability — pick the channel that can actually be reached.
    # If the data path is down but SMS works, don't waste a WhatsApp attempt.
    reach = await orange_client.device_reachability(phone_number)
    if reach is not None and not reach.get("data") and reach.get("sms"):
        channels = [c for c in channels if c == "sms"] or ["sms"]

    body = render_message(disruption)
    results: dict[str, dict] = {}

    senders = {
        "whatsapp": twilio_client.send_whatsapp,
        "sms": twilio_client.send_sms,
    }
    # In live mode, only attempt a channel whose sender address is configured.
    from_configured = {
        "whatsapp": bool(settings.TWILIO_WHATSAPP_FROM),
        "sms": bool(settings.TWILIO_SMS_FROM),
    }

    for channel in channels:
        sender = senders.get(channel)
        if sender is None:
            continue
        if settings.twilio_enabled and not from_configured.get(channel, False):
            results[channel] = {"ok": False, "reason": "no_sender_configured"}
            continue
        try:
            sid = await sender(phone_number, body)
            results[channel] = {"ok": True, "sid": sid}
        except Exception as exc:  # noqa: BLE001 - per-channel best effort
            logger.warning("notify_channel_failed", channel=channel, error=str(exc))
            results[channel] = {"ok": False, "error": str(exc)[:160]}

    sent_any = any(r.get("ok") for r in results.values())
    logger.info(
        "notification_dispatched",
        phone=phone_number,
        disruption=disruption_id,
        sent=sent_any,
    )
    return {
        "status": "sent" if sent_any else "failed",
        "channels": results,
        "preview": body,
    }
