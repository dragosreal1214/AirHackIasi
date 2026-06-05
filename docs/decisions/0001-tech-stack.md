# ADR 0001 — Tech stack

**Status:** Accepted
**Date:** 2026-06-05

## Context

48-hour hackathon, 5 developers, production-grade target. We need a stack the
whole team is productive in immediately, with generous free tiers for hosting.

## Decision

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui.
- **Backend:** FastAPI (Python 3.11+) + Pydantic v2 + SQLAlchemy 2.0 async.
- **Data:** Supabase Postgres (managed, EU/Frankfurt) with Realtime + RLS.
- **ML:** XGBoost via scikit-learn, models served from the API process.
- **Monorepo:** pnpm workspaces + Turbo for JS, Poetry for Python.
- **Hosting:** Vercel (web), Fly.io (api), Supabase (db).

## Consequences

- The stack is **locked** — see root `CLAUDE.md`. No alternatives mid-hackathon.
- Python and JS toolchains coexist; Turbo orchestrates the JS side only, the
  API is driven through Poetry scripts.
