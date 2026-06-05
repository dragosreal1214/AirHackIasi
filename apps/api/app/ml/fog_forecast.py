"""Live fog forecast for LRIA via Open-Meteo (free, no key).

Pulls the hourly forecast, computes the model's 6 features per hour, runs the
fog model, and exposes an hourly risk timeline + high-risk windows + peak.
Cached for 15 minutes. Falls back to an empty timeline if Open-Meteo is
unreachable (callers handle gracefully).
"""

from __future__ import annotations

import time
from typing import Any

import httpx
import structlog

from app.ml.fog_history import HIGH_RISK_THRESHOLD
from app.ml.fog_model import fog_model

logger = structlog.get_logger(__name__)

_URL = "https://api.open-meteo.com/v1/forecast"
_TTL_SECONDS = 900

# Cache hourly timelines per "lat,lon" key.
_cache: dict[str, dict[str, Any]] = {}


async def _fetch_hourly(lat: float, lon: float) -> list[dict[str, Any]]:
    key = f"{lat:.3f},{lon:.3f}"
    entry = _cache.get(key)
    if entry is not None and (time.monotonic() - entry["ts"]) < _TTL_SECONDS:
        return entry["hourly"]

    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,dew_point_2m,relative_humidity_2m,wind_speed_10m",
        "wind_speed_unit": "kn",
        "forecast_days": 2,
        "timezone": "UTC",
    }
    async with httpx.AsyncClient(timeout=15) as http:
        resp = await http.get(_URL, params=params)
        resp.raise_for_status()
        h = resp.json()["hourly"]

    out: list[dict[str, Any]] = []
    for i, t in enumerate(h["time"]):
        temp = h["temperature_2m"][i]
        dew = h["dew_point_2m"][i]
        if temp is None or dew is None:
            continue
        hour = int(t[11:13])
        month = int(t[5:7])
        features = {
            "temperature": temp,
            "dewpoint_depression": round(temp - dew, 1),
            "wind_speed": h["wind_speed_10m"][i] or 0,
            "humidity": h["relative_humidity_2m"][i],
            "hour": hour,
            "month": month,
        }
        prob = fog_model.predict_proba(features)
        out.append(
            {
                "time": t + ":00" if len(t) == 16 else t,
                "probability": round(prob, 4),
                "level": fog_model.risk_level(prob),
                "temperature": temp,
                "dewpointDepression": features["dewpoint_depression"],
                "windSpeed": features["wind_speed"],
                "humidity": features["humidity"],
            }
        )

    _cache[key] = {"ts": time.monotonic(), "hourly": out}
    return out


def _windows(hourly: list[dict[str, Any]], threshold: float = HIGH_RISK_THRESHOLD):
    windows = []
    start = None
    last = None
    for h in hourly:
        high = h["probability"] >= threshold
        if high and start is None:
            start = h["time"]
        elif not high and start is not None:
            windows.append({"start": start, "end": h["time"]})
            start = None
        last = h["time"]
    if start is not None and last is not None:
        windows.append({"start": start, "end": last})
    return windows


def _peak(hourly: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not hourly:
        return None
    top = max(hourly, key=lambda h: h["probability"])
    feats = {
        "dewpoint_depression": top["dewpointDepression"],
        "humidity": top["humidity"],
        "wind_speed": top["windSpeed"],
        "hour": int(top["time"][11:13]),
    }
    return {
        "time": top["time"],
        "probability": top["probability"],
        "level": top["level"],
        "explanation": fog_model.explain(feats, top["probability"]),
    }


async def forecast(lat: float, lon: float, airport: str | None = None) -> dict[str, Any]:
    try:
        hourly = await _fetch_hourly(lat, lon)
    except Exception as exc:  # noqa: BLE001
        logger.warning("open_meteo_failed", airport=airport, error=str(exc))
        return {
            "source": "open-meteo",
            "available": False,
            "airport": airport,
            "hourly": [],
            "windows": [],
            "peak": None,
        }
    return {
        "source": "open-meteo",
        "available": True,
        "airport": airport,
        "hourly": hourly,
        "windows": _windows(hourly),
        "peak": _peak(hourly),
    }
