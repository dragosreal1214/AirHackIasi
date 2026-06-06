"""Pydantic v2 schemas — the API's response/request shapes.

Serialized in camelCase (via alias) to match `packages/shared/index.ts`.
FastAPI emits responses by alias, so these line up 1:1 with the TS types.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

RiskLevel = Literal["low", "moderate", "high", "critical"]
FlightStatus = Literal[
    "scheduled", "delayed", "boarding", "departed", "cancelled", "diverted"
]
PnrStatus = Literal["active", "cancelled", "completed", "disrupted"]
AlternativeType = Literal["train", "alternate_flight", "reroute_airport", "bus"]
NotificationChannel = Literal["whatsapp", "sms", "push"]


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class FlightSummary(CamelModel):
    id: str
    flight_number: str
    airline_code: str
    airline_name: str
    origin_iata: str
    origin_city: str
    destination_iata: str
    destination_city: str
    scheduled_departure: str
    scheduled_arrival: str
    status: FlightStatus


class FogWindow(CamelModel):
    start: str
    end: str


class CurrentRisk(CamelModel):
    level: RiskLevel
    probability: float
    prediction_for: str
    fog_window: FogWindow | None = None
    explanation: str | None = None


class PnrWithFlight(CamelModel):
    id: str
    status: PnrStatus
    passenger_name: str | None = None
    seat_number: str | None = None
    pnr_code: str | None = None
    flight: FlightSummary
    current_risk: CurrentRisk | None = None
    disruption_id: str | None = None


class Disruption(CamelModel):
    id: str
    flight: FlightSummary
    severity: RiskLevel
    risk: CurrentRisk
    destination_risk: CurrentRisk | None = None
    detected_at: str
    alternatives_count: int


class Gauge(CamelModel):
    key: str
    label: str
    value: float  # 0..1
    level: RiskLevel


class FlightInfo(CamelModel):
    terminal: str | None = None
    gate: str | None = None
    baggage_belt: str | None = None
    duration_minutes: int


class TimelineStep(CamelModel):
    label: str
    time: str
    done: bool


class FlightDetail(CamelModel):
    flight: FlightSummary
    risk: CurrentRisk
    destination_risk: CurrentRisk | None = None
    cancel_probability: float
    weather: list[Gauge]
    info: FlightInfo
    timeline: list[TimelineStep]
    disruption_id: str | None = None
    alternatives_count: int = 0


class Me(CamelModel):
    id: str
    full_name: str | None = None
    email: str | None = None
    phone_number: str
    preferred_language: str = "ro"
    notification_channels: list[NotificationChannel] = []


class UpdateMeRequest(CamelModel):
    full_name: str | None = None
    notification_channels: list[NotificationChannel] | None = None


class Alternative(CamelModel):
    id: str
    rank: int
    type: AlternativeType
    title: str
    subtitle: str
    departure: str
    arrival: str
    duration_minutes: int
    cost_eur: float
    reliability: float
    score: float
    action_url: str
    action_label: str


class CreatePnrInput(CamelModel):
    flight_id: str
    passenger_name: str | None = None
    seat_number: str | None = None
    pnr_code: str | None = None


# ----- Auth -----


class RegisterRequest(CamelModel):
    full_name: str
    email: str
    phone_number: str
    password: str


class LoginRequest(CamelModel):
    email: str
    password: str


class RefreshRequest(CamelModel):
    refresh_token: str


class PhoneStartRequest(CamelModel):
    phone_number: str


class PhoneStartResponse(CamelModel):
    challenge_id: str
    method: Literal["sms_otp", "dev"]


class PhoneVerifyRequest(CamelModel):
    challenge_id: str
    code: str | None = None


class TokenResponse(CamelModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ----- Notifications (dev/testing) -----


class TestNotificationRequest(CamelModel):
    phone_number: str
    disruption_id: str = "d_001"
    channels: list[NotificationChannel] | None = None
