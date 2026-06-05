"""Historical fog analysis over the real METAR dataset.

Loads metar_enhanced_ml.csv, runs the model per observation for a given day,
and derives high-risk fog windows + the peak-risk observation (with its
explanation). Ports the logic of the original generate_time_windows.py.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import structlog

from app.ml.fog_model import fog_model

logger = structlog.get_logger(__name__)

_DATA = Path(__file__).parent / "data" / "metar_enhanced_ml.csv"
HIGH_RISK_THRESHOLD = 0.65


@lru_cache(maxsize=1)
def _df():
    import pandas as pd

    df = pd.read_csv(_DATA)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df.dropna(subset=fog_model.features)


def _day(date_str: str):
    import pandas as pd

    df = _df()
    target = pd.to_datetime(date_str).date()
    day = df[df["timestamp"].dt.date == target].sort_values("timestamp").copy()
    if day.empty:
        return day
    day["prob"] = [
        fog_model.predict_proba({f: r[f] for f in fog_model.features})
        for _, r in day.iterrows()
    ]
    return day


def fog_windows(date_str: str, threshold: float = HIGH_RISK_THRESHOLD) -> list[dict[str, str]]:
    day = _day(date_str)
    if day.empty:
        return []
    windows: list[dict[str, str]] = []
    start = None
    last = None
    for _, row in day.iterrows():
        high = row["prob"] >= threshold
        if high and start is None:
            start = row["timestamp"]
        elif not high and start is not None:
            windows.append({"start": start.isoformat(), "end": row["timestamp"].isoformat()})
            start = None
        last = row["timestamp"]
    if start is not None and last is not None:
        windows.append({"start": start.isoformat(), "end": last.isoformat()})
    return windows


def peak(date_str: str) -> dict[str, Any] | None:
    day = _day(date_str)
    if day.empty:
        return None
    row = day.loc[day["prob"].idxmax()]
    features = {f: float(row[f]) for f in fog_model.features}
    prob = float(row["prob"])
    return {
        "timestamp": row["timestamp"].isoformat(),
        "probability": prob,
        "level": fog_model.risk_level(prob),
        "features": features,
        "explanation": fog_model.explain(features, prob),
        "visibility_m": int(row["visibility"]) if "visibility" in row else None,
    }
