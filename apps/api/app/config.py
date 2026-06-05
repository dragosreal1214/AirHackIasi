"""Application configuration via Pydantic Settings.

All environment variables are declared here. When adding a new env var,
update this file AND `.env.example` (see CLAUDE.md conventions).

The API boots and serves a full demo with NO credentials: missing integrations
degrade gracefully (see the `*_enabled` feature flags below). Fill the env vars
to switch each piece from mock/dev mode to the real service.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Core ---
    ENV: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # --- Database (Supabase Postgres). Empty -> in-memory store. ---
    DATABASE_URL: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # --- Redis / Celery ---
    REDIS_URL: str = ""

    # --- Auth / JWT ---
    JWT_SECRET: str = "dev-secret-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Twilio (WhatsApp + SMS + Verify) ---
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""
    TWILIO_WHATSAPP_FROM: str = ""  # e.g. "whatsapp:+14155238886" (sandbox)
    TWILIO_SMS_FROM: str = ""

    # --- Orange CAMARA (Romania): SIM Swap + KYC Match. ---
    ORANGE_CLIENT_ID: str = ""
    ORANGE_CLIENT_SECRET: str = ""
    # Optional: paste the portal's ready-made "Authorization header" value
    # (e.g. "Basic YUxh..."). If set, it's used directly for the token call
    # instead of base64-encoding CLIENT_ID:CLIENT_SECRET ourselves.
    ORANGE_AUTH_HEADER: str = ""
    ORANGE_API_BASE: str = "https://api.orange.com"
    ORANGE_TOKEN_PATH: str = "/oauth/v3/token"
    # Defaults target the Romania *sandbox* (orange-lab) products, which use
    # 2-legged OAuth and lab test numbers. For production, swap these to the
    # live product paths (note: production SIM Swap/KYC use 3-legged OAuth).
    ORANGE_SIM_SWAP_PATH: str = "/camara/orange-lab/sim-swap/v1/check"
    ORANGE_KYC_MATCH_PATH: str = "/camara/orange-lab/kyc-match/v0/match"
    # Return canned sandbox responses without calling Orange. Use while the
    # real app/subscription is awaiting activation on the portal.
    ORANGE_MOCK: bool = False

    # --- External data ---
    MAPBOX_TOKEN: str = ""
    RAPIDAPI_KEY: str = ""

    # ----- Feature flags (derived) -----

    @property
    def db_enabled(self) -> bool:
        return bool(self.DATABASE_URL)

    @property
    def twilio_enabled(self) -> bool:
        return bool(self.TWILIO_ACCOUNT_SID and self.TWILIO_AUTH_TOKEN)

    @property
    def orange_enabled(self) -> bool:
        return bool(
            self.ORANGE_AUTH_HEADER
            or (self.ORANGE_CLIENT_ID and self.ORANGE_CLIENT_SECRET)
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
