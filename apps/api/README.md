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
poetry run pytest                          # tests
poetry run ruff check .                    # lint
poetry run mypy app                        # type check
poetry run alembic upgrade head            # migrations (once configured)
```

> **Note:** Poetry is not bundled with the repo. Install it first
> (`pipx install poetry` or the official installer). Without Poetry you can
> still run the app via a plain venv: `python -m venv .venv && .venv/Scripts/pip
> install fastapi "uvicorn[standard]" pydantic-settings structlog`.
