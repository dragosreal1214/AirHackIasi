"""Bad-weather (non-fog) risk model serving.

Trained on METAR phenomena (thunderstorms, heavy precip, hail, squalls) + strong
wind — see scripts/ml/train_bad_weather.py. Same 6 features as the fog model, so
it scores the same live Open-Meteo forecast rows. Falls back to a wind heuristic.
"""

from __future__ import annotations

import pickle
from pathlib import Path

import structlog

from app.ml.fog_model import DEFAULT_FEATURES, RiskLevel

logger = structlog.get_logger(__name__)

_MODELS_DIR = Path(__file__).parent / "models"


class BadWeatherModel:
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
                with open(_MODELS_DIR / "bad_weather_model_v1.pkl", "rb") as f:
                    self._model = pickle.load(f)
                with open(_MODELS_DIR / "bad_weather_features_v1.pkl", "rb") as f:
                    self._features = pickle.load(f)
            self.using_fallback = False
            logger.info("bad_weather_model_loaded", features=self._features)
        except Exception as exc:  # noqa: BLE001 - degrade to rule-based
            logger.warning("bad_weather_model_load_failed", error=str(exc))
            self.using_fallback = True

    def predict_proba(self, features: dict[str, float]) -> float:
        self.load()
        if self.using_fallback or self._model is None:
            wind = features.get("wind_speed", 0) or 0
            return min(0.9, max(0.0, (wind - 12) / 30))  # rises past ~12 kt
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


bad_weather_model = BadWeatherModel()
