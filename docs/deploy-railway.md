# Deploying Fogora to Railway

Two Railway services from this one repo, plus Supabase (already hosted):

| Service | Root directory | Builder | Serves |
| ------- | -------------- | ------- | ------ |
| **fogora-api** | `apps/api` | Dockerfile (`apps/api/railway.json`) | FastAPI on `$PORT` |
| **fogora-web** | `/` (repo root) | Nixpacks (`/railway.json`) | Next.js on `$PORT` |

> Frontend can also go on **Vercel** (zero-config for a Next monorepo: set root
> `apps/web`, add the `NEXT_PUBLIC_*` vars). Railway works too — steps below.

---

## 0. One-time

1. Push to GitHub (done).
2. In Railway: **New Project → Deploy from GitHub repo** → pick this repo.
3. Add **two services** from the same repo (see below). Set each service's
   **Root Directory** exactly as in the table.

---

## 1. API service (`fogora-api`)

- **Root Directory:** `apps/api` → Railway picks up `apps/api/railway.json`
  (Dockerfile build, `/health` healthcheck, runs `alembic upgrade head` on boot).
- **Variables** (Service → Variables):

```
ENV=production
DEBUG=false
JWT_SECRET=<run: openssl rand -hex 32>
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<pwd>@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role>
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ORANGE_AUTH_HEADER=Basic ...        # or ORANGE_CLIENT_ID + ORANGE_CLIENT_SECRET
ORANGE_TOKEN_PATH=/openidconnect/playground/v1.0/token
ORANGE_SIM_SWAP_PATH=/camara/playground/api/sim-swap/v1/check
ORANGE_KYC_MATCH_PATH=/camara/playground/api/kyc-match/v0.2/match
LIVE_FORECAST=true
FORCE_FOG_IATA=                      # leave EMPTY in prod (real forecast)
CORS_ORIGINS=["https://<web-domain>"]   # the web service URL — set after step 2
```

- `DEBUG=false` disables the `/dev/*` endpoints and the app **refuses to boot**
  with a default `JWT_SECRET` (set a strong one).
- After deploy you get a URL like `https://fogora-api-production.up.railway.app`.

## 2. Web service (`fogora-web`)

- **Root Directory:** `/` (repo root) → uses the root `railway.json` (Nixpacks:
  `pnpm install --frozen-lockfile && pnpm --filter web build`; start
  `next start -p $PORT`).
- **Variables** (these are inlined at **build** time, so they must be set before/at build):

```
NEXT_PUBLIC_API_URL=https://<fogora-api-domain>      # from step 1
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_MAPBOX_TOKEN=                            # optional (map fallback if empty)
```

- After deploy you get `https://fogora-web-production.up.railway.app`.

## 3. Wire the two together (CORS)

1. Put the **web** URL into the API's `CORS_ORIGINS` and redeploy the API.
2. Put the **API** URL into the web's `NEXT_PUBLIC_API_URL` and redeploy the web
   (NEXT_PUBLIC vars only take effect on a rebuild).

That circular dependency is normal: deploy API → set web env → deploy web →
set API CORS → redeploy API.

## 4. Verify

- `GET https://<api>/health` → `{"status":"ok"}`
- Open `https://<web>` → cinematic landing → register/login → trips.
- API logs show `api_starting db=True twilio=True orange=True fog_model=loaded`.

---

## Production notes

- **Migrations** run automatically on each API boot (`alembic upgrade head`,
  idempotent). Keep `numReplicas: 1` so two instances don't migrate at once.
- **Rate limiting** is in-memory (per instance). Fine for 1 replica; back it
  with Redis (`REDIS_URL`) before scaling out.
- **Rotate** the Supabase DB password, `service_role`, Twilio token and Orange
  secret (they passed through chat) and set the fresh values only in Railway.
- **Custom domain:** add it on the web service, then add it to the API
  `CORS_ORIGINS`.
- The fog model + dataset ship inside the API image (~app/ml/). First build is
  large (xgboost/sklearn); subsequent builds are cached.
