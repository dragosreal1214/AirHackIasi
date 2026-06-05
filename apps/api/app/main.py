"""Aerly API entrypoint."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.rate_limit import limiter
from app.routers import auth, dev, disruptions, flights, health, ml, pnrs

logger = structlog.get_logger(__name__)

_INSECURE_SECRETS = {"dev-secret-change-me", "change-me-in-production", ""}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup / shutdown hooks.

    ML models are loaded here (not per-request) once available — see CLAUDE.md.
    """
    # Fail fast: never run production with a default/weak JWT secret.
    if settings.ENV == "production" and settings.JWT_SECRET in _INSECURE_SECRETS:
        raise RuntimeError("JWT_SECRET must be set to a strong value in production")

    # Load the fog model once at startup (not per request).
    from app.ml.fog_model import fog_model

    fog_model.load()

    logger.info(
        "api_starting",
        env=settings.ENV,
        db=settings.db_enabled,
        twilio=settings.twilio_enabled,
        orange=settings.orange_enabled,
        fog_model="loaded" if not fog_model.using_fallback else "fallback",
    )
    yield
    logger.info("api_stopping")


app = FastAPI(
    title="Aerly API",
    version="0.1.0",
    description="Fog disruption copilot backend.",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health is unprefixed (used by load balancers). The rest live under /api/v1.
app.include_router(health.router)

prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=prefix)
app.include_router(flights.router, prefix=prefix)
app.include_router(pnrs.router, prefix=prefix)
app.include_router(disruptions.router, prefix=prefix)
app.include_router(ml.router, prefix=prefix)

if settings.DEBUG:
    app.include_router(dev.router, prefix=prefix)
