"""SQLAlchemy 2.0 ORM models (Postgres / Supabase)."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = _uuid_pk()
    phone_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    phone_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    email: Mapped[str | None] = mapped_column(String)
    full_name: Mapped[str | None] = mapped_column(String)
    preferred_language: Mapped[str] = mapped_column(String, default="ro")
    notification_channels: Mapped[list[str]] = mapped_column(
        JSONB, default=lambda: ["whatsapp", "sms"]
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    pnrs: Mapped[list["Pnr"]] = relationship(back_populates="user")


class Airport(Base):
    __tablename__ = "airports"

    iata_code: Mapped[str] = mapped_column(String(3), primary_key=True)
    icao_code: Mapped[str | None] = mapped_column(String(4))
    name: Mapped[str] = mapped_column(String)
    city: Mapped[str] = mapped_column(String)
    country: Mapped[str] = mapped_column(String)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    timezone: Mapped[str | None] = mapped_column(String)


class Airline(Base):
    __tablename__ = "airlines"

    iata_code: Mapped[str] = mapped_column(String(2), primary_key=True)
    icao_code: Mapped[str | None] = mapped_column(String(3))
    name: Mapped[str] = mapped_column(String)
    support_phone: Mapped[str | None] = mapped_column(String)


class Flight(Base):
    __tablename__ = "flights"

    # String slug PK (e.g. "fl_ro632" now; external flight id later). Lets the
    # in-memory demo catalog and DB rows share identifiers.
    id: Mapped[str] = mapped_column(String, primary_key=True)
    flight_number: Mapped[str] = mapped_column(String, index=True)
    airline_code: Mapped[str] = mapped_column(ForeignKey("airlines.iata_code"))
    origin_iata: Mapped[str] = mapped_column(ForeignKey("airports.iata_code"))
    destination_iata: Mapped[str] = mapped_column(ForeignKey("airports.iata_code"))
    scheduled_departure: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    scheduled_arrival: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String, default="scheduled")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Pnr(Base):
    __tablename__ = "pnrs"
    __table_args__ = (UniqueConstraint("user_id", "flight_id", name="uq_pnr_user_flight"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    # Plain string (no FK): references the in-memory catalog slug for now, a
    # real flights row later — decoupled so the demo data can stay in memory.
    flight_id: Mapped[str] = mapped_column(String, index=True)
    pnr_code: Mapped[str | None] = mapped_column(String)
    passenger_name: Mapped[str | None] = mapped_column(String)
    seat_number: Mapped[str | None] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="active")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="pnrs")


class AuthAuditLog(Base):
    __tablename__ = "auth_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    phone_number: Mapped[str | None] = mapped_column(String, index=True)
    event: Mapped[str] = mapped_column(String)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    meta: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
