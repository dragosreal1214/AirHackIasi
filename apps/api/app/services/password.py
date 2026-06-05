"""Password hashing (bcrypt).

Uses the `bcrypt` library directly — passlib's bcrypt backend is incompatible
with bcrypt 4.x. bcrypt has a 72-byte input limit, so we truncate defensively.
"""

import bcrypt

_MAX = 72


def hash_password(password: str) -> str:
    pw = password.encode("utf-8")[:_MAX]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    pw = password.encode("utf-8")[:_MAX]
    try:
        return bcrypt.checkpw(pw, password_hash.encode("utf-8"))
    except ValueError:
        return False
