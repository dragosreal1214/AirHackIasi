"""Fog ML endpoints — live prediction + historical fog windows."""

from typing import Any

from fastapi import APIRouter, Query

from fastapi import HTTPException

from app.ml import airports as airport_registry
from app.ml import fog_forecast, fog_history
from app.ml.fog_model import fog_model

router = APIRouter(prefix="/ml", tags=["ml"])


@router.get("/airports")
async def list_airports() -> list[dict[str, Any]]:
    return [
        {"iata": a.iata, "name": a.name, "city": a.city, "country": a.country}
        for a in airport_registry.AIRPORTS.values()
    ]


@router.get("/model-info")
async def model_info() -> dict[str, Any]:
    fog_model.load()
    return {"features": fog_model.features, "usingFallback": fog_model.using_fallback}


@router.get("/predict")
async def predict(
    temperature: float = Query(...),
    dewpoint_depression: float = Query(...),
    wind_speed: float = Query(...),
    humidity: float = Query(...),
    hour: int = Query(..., ge=0, le=23),
    month: int = Query(..., ge=1, le=12),
) -> dict[str, Any]:
    features = {
        "temperature": temperature,
        "dewpoint_depression": dewpoint_depression,
        "wind_speed": wind_speed,
        "humidity": humidity,
        "hour": hour,
        "month": month,
    }
    prob = fog_model.predict_proba(features)
    return {
        "probability": round(prob, 4),
        "level": fog_model.risk_level(prob),
        "explanation": fog_model.explain(features, prob),
        "usingFallback": fog_model.using_fallback,
    }


@router.get("/fog-windows")
async def fog_windows(date: str = Query(..., description="YYYY-MM-DD")) -> dict[str, Any]:
    """High-risk fog windows predicted by the model for a historical day."""
    return {
        "date": date,
        "windows": fog_history.fog_windows(date),
        "peak": fog_history.peak(date),
    }


@router.get("/forecast")
async def forecast(airport: str = "IAS") -> dict[str, Any]:
    """LIVE hourly fog-risk timeline for an airport via Open-Meteo."""
    a = airport_registry.get(airport)
    if a is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "AIRPORT_NOT_FOUND", "message": f"Aeroport necunoscut: {airport}"},
        )
    result = await fog_forecast.forecast(a.lat, a.lon, airport=a.iata)
    result["airportName"] = a.name
    result["city"] = a.city
    return result


@router.get("/timeline")
async def timeline(date: str = Query(..., description="YYYY-MM-DD")) -> dict[str, Any]:
    """REPLAY: hourly fog-risk timeline for a historical day from the dataset."""
    return {
        "source": "replay",
        "available": True,
        "date": date,
        "hourly": fog_history.timeline(date),
        "windows": fog_history.fog_windows(date),
        "peak": fog_history.peak(date),
    }
