# Aerly ✈️🌫️

> **Cu un aer înainte.**

Aerly is a **fog disruption copilot** for airline passengers at Iași airport
(LRIA), Romania. It predicts fog **3–5 hours in advance** using ML on METAR
data, finds the passengers whose flights are at risk, and sends them ranked
alternatives — train, alternate flight, reroute, bus — over WhatsApp.

Built for **Air Hack Iași 2026** (48-hour hackathon), targeting production
quality.

---

## Monorepo layout

```
aerly/
├── apps/
│   ├── web/           # Next.js 14 PWA (passenger + ops dashboard)
│   └── api/           # FastAPI backend
├── packages/
│   └── shared/        # Shared TypeScript types (the web ↔ api contract)
├── scripts/           # Data scrapers & ML training (Python)
├── docs/              # ADRs, API spec, ML reports
└── .github/workflows/ # CI
```

This is a **pnpm + Turbo** monorepo for the JS side and **Poetry** for the
Python API.

## Tech stack

| Layer    | Choice                                                         |
| -------- | -------------------------------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui       |
| Backend  | FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic            |
| Data     | Supabase Postgres 15 (Realtime + RLS)                          |
| ML       | XGBoost via scikit-learn, served from the API                 |
| Infra    | Vercel (web) · Fly.io (api) · Supabase (db)                    |

The stack is **locked** — see [`CLAUDE.md`](./CLAUDE.md).

## Prerequisites

- **Node 20+** and **pnpm 10+**
- **Python 3.11+** and **[Poetry](https://python-poetry.org/)** (for `apps/api`)

## Getting started

```bash
# 1. Install JS workspace deps
pnpm install

# 2. Install API deps
cd apps/api && poetry install && cd ../..

# 3. Configure environment
cp apps/api/.env.example apps/api/.env   # fill in secrets

# 4. Run everything (web + api) via Turbo
pnpm dev
```

### Run individually

```bash
pnpm --filter web dev                                   # web  → http://localhost:3000
cd apps/api && poetry run uvicorn app.main:app --reload # api  → http://localhost:8000
```

API health check: `GET http://localhost:8000/health`.

## Common commands

```bash
pnpm dev          # run web + api
pnpm build        # build all JS packages
pnpm lint         # lint JS packages
pnpm typecheck    # typecheck JS packages

# API (from apps/api)
poetry run pytest          # tests
poetry run ruff check .    # lint
poetry run mypy app        # type check
```

## Team & ownership

| Role | Area                                                      |
| ---- | --------------------------------------------------------- |
| P1   | Backend lead — `apps/api`, DB schema, deploy              |
| P2   | ML — `scripts/`, `apps/api/app/ml/`, alternatives engine  |
| P3   | Frontend (passenger) — `apps/web/app/(passenger)`         |
| P4   | Frontend (ops) — `apps/web/app/(ops)`, integrations       |
| P5   | Coordinator / UX — design system, copy                    |

## Deployment

Deploy to **Railway** (two services: `apps/api` via Dockerfile, web via Nixpacks)
— see [`docs/deploy-railway.md`](./docs/deploy-railway.md). Credentials map in
[`docs/credentials.md`](./docs/credentials.md).

## Status

🟢 **MVP.** Cinematic Fogora frontend (onboarding → hub → trips → disruption +
alternatives, help/hotels/compensation, PWA-installable) on a live backend:
Supabase persistence, phone-OTP + email/password auth (JWT), XGBoost fog model
with live Open-Meteo forecast, real LRIA schedule, WhatsApp alerts (Twilio),
Orange SIM-swap/KYC. See [`docs/`](./docs).
