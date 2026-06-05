"""Fog risk model serving.

Loads the trained XGBoost classifier (apps/api/app/ml/models/) and exposes
probability + risk level + a Romanian explanation. Falls back to a transparent
rule-based estimate if the model can't be loaded, so the API never hard-fails.

Features (order matters): temperature, dewpoint_depression, wind_speed,
humidity, hour, month.
"""

from __future__ import annotations

import pickle
from pathlib import Path
from typing import Literal

import structlog

logger = structlog.get_logger(__name__)

RiskLevel = Literal["low", "moderate", "high", "critical"]

_MODELS_DIR = Path(__file__).parent / "models"
DEFAULT_FEATURES = [
    "temperature",
    "dewpoint_depression",
    "wind_speed",
    "humidity",
    "hour",
    "month",
]


class FogModel:
    def __init__(self) -> None:
        self._model = None
        self._features: list[str] = DEFAULT_FEATURES
        self._loaded = False
        self.using_fallback = True

    def load(self) -> None:
        if self._loaded:
            return
        self._loaded = True
        try:
            import warnings

            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                with open(_MODELS_DIR / "fog_model_v1.pkl", "rb") as f:
                    self._model = pickle.load(f)
                with open(_MODELS_DIR / "features_v1.pkl", "rb") as f:
                    self._features = pickle.load(f)
            self.using_fallback = False
            logger.info("fog_model_loaded", features=self._features)
        except Exception as exc:  # noqa: BLE001 - degrade to rule-based
            logger.warning("fog_model_load_failed", error=str(exc))
            self.using_fallback = True

    @property
    def features(self) -> list[str]:
        return self._features

    def predict_proba(self, features: dict[str, float]) -> float:
        self.load()
        if self.using_fallback or self._model is None:
            return _rule_based_proba(features)
        import pandas as pd

        row = pd.DataFrame([{f: features.get(f) for f in self._features}])
        return float(self._model.predict_proba(row[self._features])[0][1])

    @staticmethod
    def risk_level(prob: float) -> RiskLevel:
        if prob < 0.25:
            return "low"
        if prob < 0.55:
            return "moderate"
        if prob < 0.90:
            return "high"
        return "critical"

    @staticmethod
    def explain(features: dict[str, float], prob: float) -> str:
        """Romanian, human-readable 'why' (ported from explain_logic.py)."""
        reasons: list[str] = []
        dd = features.get("dewpoint_depression")
        hum = features.get("humidity")
        wind = features.get("wind_speed")
        hour = features.get("hour")

        if dd is not None and dd <= 1.0:
            reasons.append(f"diferență minimă temp/punct de rouă ({dd}°C)")
        elif dd is not None and dd <= 2.0:
            reasons.append("atmosferă aproape de saturație")
        if hum is not None and hum >= 95:
            reasons.append(f"umiditate extremă ({round(hum)}%)")
        elif hum is not None and hum >= 90:
            reasons.append("umiditate ridicată")
        if wind is not None and wind <= 3:
            reasons.append(f"vânt calm ({round(wind)} kt)")
        elif wind is not None and wind <= 6:
            reasons.append("vânt slab")
        if hour is not None and 0 <= hour <= 7:
            reasons.append("interval critic de radiație matinală")

        why = " + ".join(reasons) if reasons else "condiții meteo standard"
        return f"{prob:.0%} risc de ceață — {why}."


def _rule_based_proba(features: dict[str, float]) -> float:
    """Transparent meteorological heuristic used if the model is unavailable."""
    dd = features.get("dewpoint_depression", 10) or 10
    hum = features.get("humidity", 50) or 50
    wind = features.get("wind_speed", 10) or 10
    score = 0.0
    if dd <= 0.5:
        score += 0.5
    elif dd <= 1.5:
        score += 0.3
    elif dd <= 3:
        score += 0.1
    if hum >= 97:
        score += 0.3
    elif hum >= 92:
        score += 0.15
    if wind <= 2:
        score += 0.15
    elif wind <= 5:
        score += 0.05
    return min(score, 0.99)


fog_model = FogModel()
