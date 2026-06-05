"""Notification dispatcher.

Renders the fog-warning message (Romanian) and sends it over the user's
channels via Twilio. With no Twilio credentials it logs the message in dev mode
so the flow is demonstrable offline.

(Orange Device Location is not among the available RO CAMARA products, so the
urgency line is generic. If a location product becomes available we can tailor
it per distance-to-airport.)
"""

from __future__ import annotations

import structlog

from app.config import settings
from app.models.schemas import Disruption
from app.services import store
from app.services.integrations import twilio_client

logger = structlog.get_logger(__name__)


def render_whatsapp(disruption: Disruption) -> str:
    f = disruption.flight
    pct = round(disruption.risk.probability * 100)
    return (
        f"⚠️ Aerly: zborul {f.flight_number} ({f.origin_iata}→{f.destination_iata}) "
        f"are risc de ceață {pct}% la plecare.\n"
        f"Decide din timp — avem alternative pre-calculate.\n"
        f"Vezi alternative: https://aerly.app/d/{disruption.id}"
    )


async def dispatch(phone_number: str, disruption_id: str) -> dict[str, str]:
    disruption = store.DISRUPTIONS.get(disruption_id)
    if disruption is None:
        return {"status": "skipped", "reason": "unknown_disruption"}

    body = render_whatsapp(disruption)

    # WhatsApp first, SMS fallback.
    await twilio_client.send_whatsapp(phone_number, body)
    if not settings.twilio_enabled:
        # dev mode: also exercise the SMS path so both channels are visible
        await twilio_client.send_sms(phone_number, body)

    logger.info("notification_dispatched", phone=phone_number, disruption=disruption_id)
    return {"status": "sent", "channel": "whatsapp", "preview": body}
