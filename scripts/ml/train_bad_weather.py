"""Train a bad-weather (non-fog) disruption model from the METAR dataset.

Fog has its own model; this one targets the OTHER weather that disrupts flights:
thunderstorms, heavy precip, hail, squalls, and strong wind. The label is
derived from the raw METAR phenomena + wind speed. Same 6 met features as the
fog model, so it scores live Open-Meteo forecasts the same way.

Run from repo root with the API venv:
    apps/api/.venv/Scripts/python.exe scripts/ml/train_bad_weather.py
"""

from __future__ import annotations

import pickle
import re
from pathlib import Path

import pandas as pd
import xgboost as xgb
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split

ML = Path(__file__).resolve().parents[2] / "apps" / "api" / "app" / "ml"
FEATURES = ["temperature", "dewpoint_depression", "wind_speed", "humidity", "hour", "month"]

# Convective / heavy-precip / hazard phenomena in the raw METAR.
BAD_WX = re.compile(
    r"(\+?TSRA|\bTS\b|\+TS|VCTS|\+RA|\+SHRA|SHRA|\+DZ|FZRA|FZDZ|GR|GS|"
    r"\+SN|SHSN|\+SHSN|BLSN|SQ|\+FC|FC|\+UP|\bDS\b|\bSS\b)"
)
WIND_KT = 25  # strong/gale-ish surface wind (knots)


def main() -> None:
    df = pd.read_csv(ML / "data" / "metar_enhanced_ml.csv")
    df["raw_metar"] = df["raw_metar"].fillna("")

    phenom = df["raw_metar"].str.contains(BAD_WX, regex=True)
    windy = df["wind_speed"].fillna(0) >= WIND_KT
    df["is_bad_weather"] = (phenom | windy).astype(int)

    df = df.dropna(subset=FEATURES + ["is_bad_weather"])
    X, y = df[FEATURES], df["is_bad_weather"]
    print(f"rows={len(df)}  bad-weather positives={int(y.sum())} ({y.mean()*100:.1f}%)")
    print(f"  from phenomena={int(phenom.sum())}  from wind>={WIND_KT}kt={int(windy.sum())}")

    x_tr, x_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    # NOTE: no scale_pos_weight — we want *calibrated* probabilities for the gauge
    # (a weighted model inflates every score toward 1). Color thresholds handle severity.
    model = xgb.XGBClassifier(
        max_depth=5, learning_rate=0.08, n_estimators=200,
        objective="binary:logistic", random_state=42,
    )
    model.fit(x_tr, y_tr)

    probs = model.predict_proba(x_te)[:, 1]
    pred = (probs >= 0.5).astype(int)
    print("\n=== held-out test @0.5 ===")
    print(classification_report(y_te, pred, digits=3, target_names=["calm", "bad-wx"]))
    print("confusion:", confusion_matrix(y_te, pred).tolist())
    print(f"ROC-AUC = {roc_auc_score(y_te, probs):.4f}")
    print("\nfeature importances:")
    for n, imp in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {n:22s}{imp:.3f}")

    (ML / "models").mkdir(exist_ok=True)
    with open(ML / "models" / "bad_weather_model_v1.pkl", "wb") as f:
        pickle.dump(model, f)
    with open(ML / "models" / "bad_weather_features_v1.pkl", "wb") as f:
        pickle.dump(FEATURES, f)
    print("\nsaved bad_weather_model_v1.pkl")


if __name__ == "__main__":
    main()
