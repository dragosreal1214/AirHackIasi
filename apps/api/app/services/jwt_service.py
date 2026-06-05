"""JWT issuing/verification (HS256) with expiry.

Access tokens are short-lived; refresh tokens longer. Both carry `iat`/`exp`
and a `type` claim so a refresh token can't be used as an access token.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Literal

from jose import JWTError, jwt

from app.config import settings

ALGORITHM = "HS256"
TokenType = Literal["access", "refresh"]


def _encode(subject: str, ttl: timedelta, token_type: TokenType) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + ttl,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def create_access_token(user_id: str) -> str:
    return _encode(
        user_id, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), "access"
    )


def create_refresh_token(user_id: str) -> str:
    return _encode(
        user_id, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS), "refresh"
    )


def decode_token(token: str, expected_type: TokenType = "access") -> str | None:
    """Return the subject (user id) if valid and of the right type, else None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None
    if payload.get("type") != expected_type:
        return None
    return payload.get("sub")
