# Aerly API

FastAPI backend for Aerly.

## Setup

Requires Python 3.11+ and [Poetry](https://python-poetry.org/docs/#installation).

```bash
poetry install
cp .env.example .env   # then fill in secrets
poetry run uvicorn app.main:app --reload
```

The API serves on http://localhost:8000. Health check: `GET /health`.
Interactive docs: http://localhost:8000/docs.

## Commands

```bash
poetry run uvicorn app.main:app --reload   # dev server
poetry run pytest                          # tests (hermetic: in-memory, no DB)
poetry run ruff check .                    # lint
poetry run mypy app                        # type check
poetry run alembic upgrade head            # apply DB migrations
poetry run alembic revision -m "msg"       # new migration
```

## Security posture

- **Auth:** phone OTP (Twilio Verify; dev OTP `000000` when unset) → signed
  **JWT** access/refresh tokens with expiry (`app/services/jwt_service.py`).
  `/auth/*` endpoints are rate-limited; auth events go to `auth_audit_log`.
- **Per-user data:** PNR endpoints require a Bearer token and are scoped to the
  authenticated user. In `DEBUG` a tokenless request maps to a demo user.
- **Row Level Security:** enabled on `users`, `pnrs`, `auth_audit_log` so the
  public Supabase `anon` key cannot read PII via PostgREST.
- **Boot guard:** the app refuses to start in `ENV=production` with a default
  `JWT_SECRET`.

## Modes

With `DATABASE_URL` set, users/PNRs persist in Postgres. Empty → in-memory
store (the flight catalog + disruptions/alternatives are always in-memory for
demo freshness).

> **Note:** Poetry is not bundled with the repo. Install it first
> (`pipx install poetry` or the official installer). Without Poetry you can
> still run the app via a plain venv: `python -m venv .venv && .venv/Scripts/pip
> install fastapi "uvicorn[standard]" pydantic-settings structlog`.
