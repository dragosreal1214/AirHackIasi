# Credentials — where everything goes

The app runs **fully without any credentials** (mock/dev mode). Each secret you
add switches one piece from mock to real. There are exactly **two files** to
edit, both git-ignored:

| File | Used by | Create from |
| ---- | ------- | ----------- |
| `apps/api/.env` | FastAPI backend | `cp apps/api/.env.example apps/api/.env` |
| `apps/web/.env.local` | Next.js web app | `cp apps/web/.env.example apps/web/.env.local` |

> ⚠️ Never commit these. Never put a `service_role` or any secret key in a
> `NEXT_PUBLIC_*` var — those ship to the browser.

After editing, restart the affected dev server.

---

## What each credential unlocks

### 1. Supabase — database, auth store, realtime
Get from Supabase dashboard → Project Settings → API & Database.

```
# apps/api/.env
DATABASE_URL=postgresql+asyncpg://postgres:<password>@<host>:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # backend only, secret

# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```
Empty `DATABASE_URL` → backend uses the in-memory store.

### 2. Twilio — phone OTP login + WhatsApp/SMS notifier
Get from Twilio Console. Create a **Verify Service** for OTP.

```
# apps/api/.env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   # sandbox or approved sender
TWILIO_SMS_FROM=+1...
```
Empty → OTP is the fixed dev code **`000000`** and messages are logged, not sent.

### 3. Orange CAMARA (Romania) — SIM Swap + KYC Match
Available on the RO account: **SIM Swap** and **KYC Match**. (Number
Verification is *not* available, so login uses SMS OTP via Twilio.)
Get `client_id` / `client_secret` from the Orange Developer portal.

```
# apps/api/.env  — set CLIENT_ID + CLIENT_SECRET, OR paste the portal's
# ready-made "Authorization header" into ORANGE_AUTH_HEADER (either works).
ORANGE_CLIENT_ID=...
ORANGE_CLIENT_SECRET=...
ORANGE_AUTH_HEADER=          # e.g. "Basic YUxh..." (alternative to the two above)
ORANGE_API_BASE=https://api.orange.com
ORANGE_TOKEN_PATH=/oauth/v3/token
```
This is a 2-legged (client_credentials) app. Note: the API *subscriptions* must
also be **Approved** on the portal (separate from the app being approved) before
calls succeed — until then they 403 and the app falls back gracefully.

How we use them:
- **SIM Swap** — checked at login (after OTP) as an account-takeover signal.
- **KYC Match** — verify a passenger's identity matches the SIM owner on file.

### Sandbox (recommended for the hackathon)
We default to the Romania **sandbox** (`orange-lab`) products — verified from the
Orange docs. They use the same 2-legged credentials and provide lab test numbers,
so we can build/demo without approval or real SIMs.

| Path | Value |
| ---- | ----- |
| SIM Swap | `POST /camara/orange-lab/sim-swap/v1/check` |
| KYC Match | `POST /camara/orange-lab/kyc-match/v0/match` |

**Sandbox test numbers** (`+4078910305x`), all with a recent (–1 day) SIM swap:

| Phone | KYC identity | City |
| ----- | ------------ | ---- |
| +40789103050 | Andrei Mihai Popescu | București |
| +40789103051 | Ioana Elena Marinescu | București |
| +40789103052 | Catalin Andrei Iordache | Cluj-Napoca |
| +40789103053 | Madalina Ioana Dobre | **Iași** |

Quick test once `.env` has the creds (API running):
```
GET /api/v1/dev/orange/status                         # token works?
GET /api/v1/dev/orange/sim-swap?phone=+40789103051    # -> { "swapped": true }
GET /api/v1/dev/orange/kyc-match?phone=+40789103053   # -> per-field match result
```

> **Production later:** set `ORANGE_SIM_SWAP_PATH` / `ORANGE_KYC_MATCH_PATH` to
> the live product paths. Note production SIM Swap/KYC use **3-legged OAuth**
> (per-user consent), a larger change than the 2-legged sandbox.
> Empty creds → SIM Swap/KYC return no signal and the app works normally.

### 4. Mapbox — ops dashboard map (public token)
```
# apps/web/.env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk....
```

### 5. AeroDataBox via RapidAPI — live flight schedules
```
# apps/api/.env
RAPIDAPI_KEY=...
```
Empty → flight search uses the seeded catalog.

### No key needed
- **Open-Meteo** (forecast) and **Ogimet** (historical METAR) — free, no auth.
- **Web Push (VAPID)** keys for in-app push — generated locally, not an account.

---

## Quick switch: point the web app at the real backend

1. Run the API: `cd apps/api && poetry run uvicorn app.main:app --reload` (or the venv).
2. In `apps/web/.env.local` set `NEXT_PUBLIC_API_URL=http://localhost:8000`.
3. Restart `pnpm --filter web dev`. The app now reads from FastAPI instead of mocks.
