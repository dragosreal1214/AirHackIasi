"""Rich flight-detail builder — works for ANY flight (not just disrupted ones).

Combines the real fog model risk with derived ops fields (weather gauges,
terminal/gate/belt, timeline) so every flight has a full detail screen.
The fog gauge is real model output; bad-weather/overall are derived proxies.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.ml.fog_model import fog_model
from app.models.schemas import FlightDetail, FlightInfo, Gauge, TimelineStep
from app.services import alternatives_service, flight_service
from app.services.risk_service import risk_at_airport, risk_for


def _hash(s: str) -> int:
    return sum(ord(c) for c in s)


async def build_flight_detail(flight_id: str) -> FlightDetail | None:
    flight = flight_service.get_flight(flight_id)
    if flight is None:
        return None

    risk, disruption_id = await risk_for(flight)
    dest = await risk_at_airport(flight.destination_iata, flight.scheduled_arrival)

    h = _hash(flight.id)
    fog = risk.probability
    bad_weather = round(0.15 + (h % 35) / 100, 4)  # wind/precip proxy, 0.15..0.49
    overall = round(0.65 * fog + 0.35 * bad_weather, 4)

    def gauge(key: str, label: str, val: float) -> Gauge:
        return Gauge(key=key, label=label, value=round(val, 4), level=fog_model.risk_level(val))

    weather = [
        gauge("fog", "Ceață", fog),
        gauge("bad_weather", "Vreme rea", bad_weather),
        gauge("overall", "General", overall),
    ]

    dep = datetime.fromisoformat(flight.scheduled_departure)
    arr = datetime.fromisoformat(flight.scheduled_arrival)
    duration = int((arr - dep).total_seconds() // 60)
    info = FlightInfo(
        terminal="T4" if h % 5 else "T3",
        gate=f"G{h % 24 + 1}",
        baggage_belt=f"Banda {h % 4 + 1}",
        duration_minutes=duration,
    )

    now = datetime.now(timezone.utc)

    def step(label: str, t: datetime) -> TimelineStep:
        return TimelineStep(label=label, time=t.isoformat(), done=t < now)

    timeline = [
        step("Check-in", dep - timedelta(minutes=120)),
        step("Îmbarcare", dep - timedelta(minutes=40)),
        step("Decolare", dep),
        step("Aterizare", arr),
    ]

    alts_count = len(alternatives_service.generate_alternatives(flight)) if disruption_id else 0

    return FlightDetail(
        flight=flight,
        risk=risk,
        destination_risk=dest,
        cancel_probability=round(fog, 4),
        weather=weather,
        info=info,
        timeline=timeline,
        disruption_id=disruption_id,
        alternatives_count=alts_count,
    )
