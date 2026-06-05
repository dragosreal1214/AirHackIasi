"""Password hashing round-trip."""

from app.services.password import hash_password, verify_password


def test_password_roundtrip() -> None:
    h = hash_password("strongpass123")
    assert h != "strongpass123"
    assert verify_password("strongpass123", h) is True
    assert verify_password("wrong", h) is False
