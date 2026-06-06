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
from app.routers import auth, dev, disruptions, flights, health, me, ml, pnrs, public, push

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
        monitor=settings.MONITOR_INTERVAL_MINUTES,
    )

    monitor_task = None
    if settings.MONITOR_INTERVAL_MINUTES > 0:
        import asyncio

        from app.services import disruption_monitor

        async def _loop() -> None:
            while True:
                await asyncio.sleep(settings.MONITOR_INTERVAL_MINUTES * 60)
                try:
                    await disruption_monitor.scan_and_notify()
                except Exception:  # noqa: BLE001
                    logger.warning("monitor_loop_error", exc_info=True)

        monitor_task = asyncio.create_task(_loop())

    yield

    if monitor_task is not None:
        monitor_task.cancel()
    logger.info("api_stopping")


app = FastAPI(
    title="Fogora API",
    version="0.1.0",
    description=(
        "Fog-disruption copilot backend.\n\n"
        "**Public Fog Predictor API** (for external developers) lives under "
        "`/api/public/v1` — predict fog probability from weather features, get a "
        "live hourly forecast per airport, and read model metadata. Auth via an "
        "`X-API-Key` header; rate-limited. See `docs/public-api.md`."
    ),
    contact={"name": "Fogora", "url": "https://fogora.app"},
    license_info={"name": "Demo / hackathon use"},
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
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
app.include_router(me.router, prefix=prefix)
app.include_router(push.router, prefix=prefix)
app.include_router(disruptions.router, prefix=prefix)
app.include_router(ml.router, prefix=prefix)

# Public developer API (separate namespace, API-key gated).
app.include_router(public.router, prefix="/api")

if settings.DEBUG:
    app.include_router(dev.router, prefix=prefix)
