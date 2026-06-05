"""Fog model serving tests."""

from app.ml.fog_model import fog_model

SATURATED = {
    "temperature": 1.0,
    "dewpoint_depression": 0.0,
    "wind_speed": 1.0,
    "humidity": 100.0,
    "hour": 5.0,
    "month": 12.0,
}
CLEAR = {
    "temperature": 22.0,
    "dewpoint_depression": 10.0,
    "wind_speed": 12.0,
    "humidity": 45.0,
    "hour": 14.0,
    "month": 7.0,
}


def test_saturated_is_high_risk() -> None:
    prob = fog_model.predict_proba(SATURATED)
    assert prob > 0.5
    assert fog_model.risk_level(prob) in ("high", "critical")


def test_clear_is_low_risk() -> None:
    prob = fog_model.predict_proba(CLEAR)
    assert prob < 0.2
    assert fog_model.risk_level(prob) == "low"


def test_explanation_is_romanian_and_specific() -> None:
    prob = fog_model.predict_proba(SATURATED)
    why = fog_model.explain(SATURATED, prob)
    assert "risc de ceață" in why
    assert "umiditate" in why  # saturated case cites humidity
