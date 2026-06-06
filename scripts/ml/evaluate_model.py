"""Evaluate the fog model on the held-out test split + illustrative scenarios.

Run from the repo root with the API venv:
    apps/api/.venv/Scripts/python.exe scripts/ml/evaluate_model.py

Reproduces the SAME 80/20 stratified split used in train_model.py (seed 42),
so metrics are computed on rows the model never trained on.
"""

from __future__ import annotations

import pickle
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

import pandas as pd  # noqa: E402
from sklearn.metrics import (  # noqa: E402
    auc,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split  # noqa: E402

ML = Path(__file__).resolve().parents[2] / "apps" / "api" / "app" / "ml"
FEATURES = ["temperature", "dewpoint_depression", "wind_speed", "humidity", "hour", "month"]
TARGET = "is_disrupted"


def main() -> None:
    df = pd.read_csv(ML / "data" / "metar_enhanced_ml.csv").dropna(subset=FEATURES + [TARGET])
    X, y = df[FEATURES], df[TARGET].astype(int)
    print(f"dataset rows={len(df)}  fog positives={int(y.sum())} ({y.mean() * 100:.1f}%)")

    _, x_te, _, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = pickle.loads((ML / "models" / "fog_model_v1.pkl").read_bytes())
    probs = model.predict_proba(x_te)[:, 1]

    print(f"\n=== HELD-OUT TEST SET (n={len(y_te)}) @ threshold 0.5 ===")
    print(classification_report(y_te, (probs >= 0.5).astype(int), digits=3, target_names=["clear", "fog"]))
    print("confusion [actual x pred]:", confusion_matrix(y_te, (probs >= 0.5).astype(int)).tolist())
    print(f"ROC-AUC = {roc_auc_score(y_te, probs):.4f}")
    p, r, _ = precision_recall_curve(y_te, probs)
    print(f"PR-AUC  = {auc(r, p):.4f}")

    print("\n=== threshold sweep ===")
    for t in (0.30, 0.40, 0.50, 0.60, 0.65, 0.70, 0.80):
        pr = (probs >= t).astype(int)
        print(
            f"  t={t:.2f}  precision={precision_score(y_te, pr, zero_division=0):.3f}"
            f"  recall={recall_score(y_te, pr):.3f}  f1={f1_score(y_te, pr, zero_division=0):.3f}"
        )

    print("\n=== feature importances ===")
    for n, imp in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {n:22s}{imp:.3f}")

    print("\n=== median feature values by class (0=clear, 1=fog) ===")
    print(df.groupby(TARGET)[FEATURES].median().to_string(float_format=lambda v: f"{v:.2f}"))


if __name__ == "__main__":
    sys.exit(main())
