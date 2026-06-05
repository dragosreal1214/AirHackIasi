"""Application configuration via Pydantic Settings.

All environment variables are declared here. When adding a new env var,
update this file AND `.env.example` (see CLAUDE.md conventions).
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

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/aerly"

    # --- Redis / Celery ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Auth / JWT ---
    JWT_SECRET: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Twilio ---
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""

    # --- Orange CAMARA ---
    ORANGE_CLIENT_ID: str = ""
    ORANGE_CLIENT_SECRET: str = ""
    ORANGE_API_URL: str = "https://api.orange.com/camara"

    # --- External data ---
    MAPBOX_TOKEN: str = ""
    RAPIDAPI_KEY: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
