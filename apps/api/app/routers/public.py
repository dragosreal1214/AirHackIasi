"""Public Fog Predictor API — for external developers.

The same XGBoost model that powers Fogora, exposed for third parties. Auth via
an `X-API-Key` header (open/key-less until PUBLIC_API_KEYS is configured) and
rate-limited per IP. Full reference: docs/public-api.md and the live /docs.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field

from app.config import settings
from app.deps import require_api_key
from app.ml import airports as registry
from app.ml import fog_forecast
from app.ml.fog_model import fog_model
from app.rate_limit import limiter

router = APIRouter(
    prefix="/public/v1",
    tags=["public — fog predictor"],
    dependencies=[Depends(require_api_key)],
)

_LIMIT = settings.PUBLIC_RATE_LIMIT


class PredictInput(BaseModel):
    temperature: float = Field(..., description="Air temperature, °C", examples=[2.0])
    dewpoint_depression: float = Field(
        ..., description="Temperature minus dew point, °C (0 ≈ saturated)", examples=[0.3]
    )
    wind_speed: float = Field(..., description="Wind speed, knots", examples=[2.0])
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity, %", examples=[99.0])
    hour: int = Field(..., ge=0, le=23, description="Local hour 0–23", examples=[5])
    month: int = Field(..., ge=1, le=12, description="Month 1–12", examples=[12])


class Prediction(BaseModel):
    probability: float = Field(..., description="Fog probability 0–1")
    level: str = Field(..., description="low | moderate | high | critical")
    explanation: str = Field(..., description="Human-readable drivers (Romanian)")
    using_fallback: bool = Field(..., description="True if the rule-based fallback was used")


def _predict(feats: dict[str, float]) -> Prediction:
    p = fog_model.predict_proba(feats)
    return Prediction(
        probability=round(p, 4),
        level=fog_model.risk_level(p),
        explanation=fog_model.explain(feats, p),
        using_fallback=fog_model.using_fallback,
    )


@router.get("/predict", response_model=Prediction, summary="Predict fog probability from weather features")
@limiter.limit(_LIMIT)
async def predict(
    request: Request,
    temperature: float = Query(..., description="°C"),
    dewpoint_depression: float = Query(..., description="temp − dew point, °C"),
    wind_speed: float = Query(..., description="knots"),
    humidity: float = Query(..., ge=0, le=100, description="%"),
    hour: int = Query(..., ge=0, le=23),
    month: int = Query(..., ge=1, le=12),
) -> Prediction:
    return _predict(
        {
            "temperature": temperature,
            "dewpoint_depression": dewpoint_depression,
            "wind_speed": wind_speed,
            "humidity": humidity,
            "hour": hour,
            "month": month,
        }
    )


@router.post("/predict/batch", response_model=list[Prediction], summary="Predict for up to 100 rows")
@limiter.limit(_LIMIT)
async def predict_batch(request: Request, items: list[PredictInput]) -> list[Prediction]:
    return [_predict(it.model_dump()) for it in items[:100]]


@router.get("/forecast", summary="Live hourly fog-risk forecast for an airport (Open-Meteo + model)")
@limiter.limit(_LIMIT)
async def forecast(request: Request, airport: str = Query("IAS", description="IATA code")) -> dict[str, Any]:
    a = registry.get(airport.upper())
    if a is None:
        raise HTTPException(404, detail={"code": "AIRPORT_NOT_FOUND", "message": f"Unknown airport: {airport}"})
    result = await fog_forecast.forecast(a.lat, a.lon, airport=a.iata)
    result["airportName"] = a.name
    result["city"] = a.city
    return result


@router.get("/airports", summary="Supported airports")
@limiter.limit(_LIMIT)
async def airports(request: Request) -> list[dict[str, Any]]:
    return [
        {"iata": a.iata, "name": a.name, "city": a.city, "country": a.country, "lat": a.lat, "lon": a.lon}
        for a in registry.AIRPORTS.values()
    ]


@router.get("/model", summary="Model metadata")
@limiter.limit(_LIMIT)
async def model(request: Request) -> dict[str, Any]:
    fog_model.load()
    return {
        "name": "fogora-fog-xgboost",
        "version": "v1",
        "task": "binary fog/disruption probability",
        "features": fog_model.features,
        "levels": ["low", "moderate", "high", "critical"],
        "thresholds": {"low": "<0.25", "moderate": "0.25–0.55", "high": "0.55–0.90", "critical": "≥0.90"},
        "trainedOn": "~2 years of METAR observations at LRIA (Iași)",
        "metrics": {"rocAuc": 0.99},
        "usingFallback": fog_model.using_fallback,
    }
