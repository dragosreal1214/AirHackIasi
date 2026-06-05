# Aerly — Project Context for Claude Code

## What we're building

Aerly is a fog disruption copilot for airline passengers in Iași, Romania.
It predicts fog at LRIA airport 3-5 hours in advance using ML on METAR data,
identifies affected passengers via PNR association, and sends them ranked
alternatives (train, alternate flight, reroute) via WhatsApp.

**Hackathon project, 48 hours. Production-grade target.**

## Repository structure

This is a pnpm + Poetry monorepo:

```
aerly/
├── apps/
│   ├── web/           # Next.js 14 PWA (passenger + ops dashboard)
│   └── api/           # FastAPI backend
├── packages/
│   └── shared/        # Shared TypeScript types
├── scripts/           # Data scrapers, ML training
├── .github/workflows/ # CI/CD
└── docs/              # Architecture decisions
```

## Tech stack (locked in — do not suggest alternatives)

**Frontend (`apps/web`):**
- Next.js 14 App Router, TypeScript strict
- Tailwind CSS + shadcn/ui components
- TanStack Query for data fetching
- Framer Motion for animations
- next-pwa for PWA setup
- Supabase JS client for realtime + auth
- next-intl for i18n (ro primary, en secondary)

**Backend (`apps/api`):**
- FastAPI (Python 3.11+) with Pydantic v2
- SQLAlchemy 2.0 async + asyncpg
- Alembic for migrations
- structlog for JSON logging
- slowapi for rate limiting
- Celery + Redis for background jobs
- httpx for external HTTP calls

**Data:**
- Supabase Postgres 15 (managed)
- Row Level Security on all user-data tables
- Realtime subscriptions for ops dashboard

**ML:**
- XGBoost via scikit-learn
- Trained on 2 years METAR LRIA
- Models saved as `.joblib` in `apps/api/app/ml/models/`

**Integrations:**
- Twilio WhatsApp + SMS
- Orange CAMARA APIs (Number Verification + Device Location)
- Open-Meteo for forecast (free, no key)
- Ogimet for historical METAR
- Mapbox for maps
- AeroDataBox via RapidAPI for flight schedules

**Hosting:**
- Frontend: Vercel (free tier, *.vercel.app subdomain)
- Backend: Fly.io (free tier, persistent VMs)
- DB: Supabase (free tier, EU region Frankfurt)
- Observability: Sentry + PostHog (free tiers)

## Conventions (follow strictly)

### TypeScript / Next.js
- Server Components by default, client only when state/effects needed
- File naming: kebab-case for files, PascalCase for components
- API routes go in `app/api/` only for Next.js-specific stuff (webhooks, auth proxy); main API is FastAPI
- Always type API responses with shared types from `packages/shared`
- Use absolute imports: `@/components/...` not `../../components/...`
- Forms: react-hook-form + zod validation, never raw
- Data fetching: TanStack Query exclusively, no useEffect for fetching
- State: Zustand for global state (rare), useState for local

### Python / FastAPI
- Pydantic v2 syntax (use `Annotated`, `BaseModel`, `Field`)
- Async everything — no sync DB calls
- Dependency injection via FastAPI `Depends`
- Endpoints organized in `routers/`, business logic in `services/`
- Database queries: use SQLAlchemy 2.0 ORM, raw SQL only when materially faster
- All errors raise `HTTPException` with structured `detail` dict
- Loggers via `structlog.get_logger()`, never `print()`
- Type hints mandatory on all public functions

### Database
- All migrations via Alembic in `apps/api/db/migrations/`
- Migration files named `NNN_descriptive_name.py`
- Always reversible (`downgrade()` implemented)
- Test migrations both up and down before committing

### Git
- Branches: `feature/short-description`, `fix/...`, `chore/...`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- PRs to `main` only, even brief 5-min reviews required
- Branch protection: main is protected, force-push disabled

## Important files to know

- `apps/api/app/db/schema.sql` — full DB schema reference (read-only, generated from migrations)
- `apps/api/app/config.py` — all env vars + settings (Pydantic Settings)
- `apps/web/lib/api.ts` — API client (TanStack Query factories)
- `packages/shared/types.ts` — shared TypeScript types
- `docs/api-spec.md` — API contract (truth source)
- `docs/decisions/` — ADRs for important choices

## How to build/test/run

```bash
# Install everything
pnpm install
cd apps/api && poetry install && cd ../..

# Run dev (everything)
pnpm dev  # runs web + api in parallel via turbo

# Run web only
pnpm --filter web dev

# Run api only
cd apps/api && poetry run uvicorn app.main:app --reload

# Database migrations
cd apps/api && poetry run alembic upgrade head
cd apps/api && poetry run alembic revision -m "description"

# Tests
pnpm test           # all tests
pnpm --filter web test
cd apps/api && poetry run pytest

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Do NOT

- Do NOT change the tech stack — locked decisions
- Do NOT add new dependencies without asking first (we have a fixed budget of complexity)
- Do NOT introduce new env vars without updating `.env.example` AND `apps/api/app/config.py`
- Do NOT use `any` in TypeScript — use `unknown` if truly unknown
- Do NOT use sync database calls in FastAPI
- Do NOT add styles outside Tailwind (no styled-components, no CSS modules)
- Do NOT commit secrets or `.env` files
- Do NOT write tests for trivial getters; focus on business logic
- Do NOT implement features outside the current task's scope — flag them in comments instead

## Brand voice (for UI strings)

- Romanian primary, calm, direct, actionable
- Never alarmist even for critical alerts ("Zborul tău e la risc" not "URGENT!")
- Always end screens with a clear next action verb
- Tagline: "Cu un aer înainte."

## Who works on what

- P1 (Backend Lead): apps/api, all FastAPI work, DB schema, deploy
- P2 (ML Engineer): scripts/, apps/api/app/ml/, alternatives engine
- P3 (Frontend Passenger): apps/web/app/(passenger)/*
- P4 (Frontend Ops): apps/web/app/(ops)/*, integrations
- P5 (Coordinator/UX): design system, copy, no code unless small fixes
