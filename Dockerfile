# syntax=docker/dockerfile:1
# Repo-root Dockerfile for the Fogora API.
# Build context is the repo root (so a Railway service can point at "/" and still
# build the backend). Copies only apps/api. The web app deploys separately (Vercel).
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VERSION=1.8.3 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

RUN pip install --no-cache-dir "poetry==${POETRY_VERSION}"

COPY apps/api/pyproject.toml ./
RUN poetry install --no-root --only main --no-interaction --no-ansi

COPY apps/api/ ./

EXPOSE 8000

# Railway injects $PORT. Run migrations (idempotent), then serve.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
