"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-05
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UUID = postgresql.UUID(as_uuid=True)
TS = sa.DateTime(timezone=True)


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "users",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("phone_number", sa.String(), nullable=False, unique=True),
        sa.Column("phone_verified_at", TS),
        sa.Column("email", sa.String()),
        sa.Column("full_name", sa.String()),
        sa.Column("preferred_language", sa.String(), nullable=False, server_default="ro"),
        sa.Column(
            "notification_channels",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("""'["whatsapp","sms"]'::jsonb"""),
        ),
        sa.Column("created_at", TS, nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", TS, nullable=False, server_default=sa.text("now()")),
        sa.Column("last_active_at", TS),
        sa.Column("deleted_at", TS),
    )

    op.create_table(
        "airports",
        sa.Column("iata_code", sa.String(3), primary_key=True),
        sa.Column("icao_code", sa.String(4)),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("country", sa.String(), nullable=False),
        sa.Column("latitude", sa.Float()),
        sa.Column("longitude", sa.Float()),
        sa.Column("timezone", sa.String()),
    )

    op.create_table(
        "airlines",
        sa.Column("iata_code", sa.String(2), primary_key=True),
        sa.Column("icao_code", sa.String(3)),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("support_phone", sa.String()),
    )

    op.create_table(
        "flights",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("flight_number", sa.String(), nullable=False, index=True),
        sa.Column("airline_code", sa.String(2), sa.ForeignKey("airlines.iata_code")),
        sa.Column("origin_iata", sa.String(3), sa.ForeignKey("airports.iata_code")),
        sa.Column("destination_iata", sa.String(3), sa.ForeignKey("airports.iata_code")),
        sa.Column("scheduled_departure", TS, nullable=False),
        sa.Column("scheduled_arrival", TS, nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="scheduled"),
        sa.Column("created_at", TS, nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "pnrs",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "user_id",
            UUID,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("flight_id", sa.String(), nullable=False, index=True),
        sa.Column("pnr_code", sa.String()),
        sa.Column("passenger_name", sa.String()),
        sa.Column("seat_number", sa.String()),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("created_at", TS, nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", "flight_id", name="uq_pnr_user_flight"),
    )

    op.create_table(
        "auth_audit_log",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("phone_number", sa.String(), index=True),
        sa.Column("event", sa.String(), nullable=False),
        sa.Column("success", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("meta", postgresql.JSONB()),
        sa.Column("created_at", TS, nullable=False, server_default=sa.text("now()")),
    )

    # --- Seed reference data ---
    airports = sa.table(
        "airports",
        sa.column("iata_code", sa.String),
        sa.column("icao_code", sa.String),
        sa.column("name", sa.String),
        sa.column("city", sa.String),
        sa.column("country", sa.String),
        sa.column("latitude", sa.Float),
        sa.column("longitude", sa.Float),
        sa.column("timezone", sa.String),
    )
    op.bulk_insert(
        airports,
        [
            {"iata_code": "IAS", "icao_code": "LRIA", "name": "Iași International", "city": "Iași", "country": "RO", "latitude": 47.1785, "longitude": 27.6206, "timezone": "Europe/Bucharest"},
            {"iata_code": "OTP", "icao_code": "LROP", "name": "Henri Coandă", "city": "București", "country": "RO", "latitude": 44.5722, "longitude": 26.1022, "timezone": "Europe/Bucharest"},
            {"iata_code": "SCV", "icao_code": "LRSV", "name": "Ștefan cel Mare", "city": "Suceava", "country": "RO", "latitude": 47.6875, "longitude": 26.3540, "timezone": "Europe/Bucharest"},
            {"iata_code": "BCM", "icao_code": "LRBC", "name": "George Enescu", "city": "Bacău", "country": "RO", "latitude": 46.5219, "longitude": 26.9103, "timezone": "Europe/Bucharest"},
            {"iata_code": "CLJ", "icao_code": "LRCL", "name": "Avram Iancu", "city": "Cluj-Napoca", "country": "RO", "latitude": 46.7852, "longitude": 23.6862, "timezone": "Europe/Bucharest"},
        ],
    )

    airlines = sa.table(
        "airlines",
        sa.column("iata_code", sa.String),
        sa.column("icao_code", sa.String),
        sa.column("name", sa.String),
        sa.column("support_phone", sa.String),
    )
    op.bulk_insert(
        airlines,
        [
            {"iata_code": "RO", "icao_code": "ROT", "name": "TAROM", "support_phone": "+40212014000"},
            {"iata_code": "W6", "icao_code": "WZZ", "name": "Wizz Air", "support_phone": "+40376300100"},
            {"iata_code": "A9", "icao_code": "AWS", "name": "Animawings", "support_phone": "+40213120000"},
        ],
    )

    # --- Row Level Security: deny the public anon/authenticated roles any
    # access to PII tables. The backend connects as the table owner, which
    # bypasses RLS; PostgREST roles get no policy => no access. ---
    # NOTE: enable (not FORCE) RLS — the owner role our backend uses bypasses
    # RLS, while PostgREST's anon/authenticated roles are denied (no policy).
    for table in ("users", "pnrs", "auth_audit_log"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("auth_audit_log")
    op.drop_table("pnrs")
    op.drop_table("flights")
    op.drop_table("airlines")
    op.drop_table("airports")
    op.drop_table("users")
