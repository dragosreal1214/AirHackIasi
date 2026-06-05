"""Aerly API entrypoint."""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup / shutdown hooks.

    ML models are loaded here (not per-request) once available — see CLAUDE.md.
    """
    logger.info("api_starting", env=settings.ENV)
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

app.include_router(health.router)
