"""Aerly API entrypoint."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, dev, disruptions, flights, health, pnrs

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup / shutdown hooks.

    ML models are loaded here (not per-request) once available — see CLAUDE.md.
    """
    logger.info(
        "api_starting",
        env=settings.ENV,
        db=settings.db_enabled,
        twilio=settings.twilio_enabled,
        orange=settings.orange_enabled,
    )
    yield
    logger.info("api_stopping")


app = FastAPI(
    title="Aerly API",
    version="0.1.0",
    description="Fog disruption copilot backend.",
    lifespan=lifespan,
)

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

if settings.DEBUG:
    app.include_router(dev.router, prefix=prefix)
