I now have a complete picture of the app. Here is the integration plan.

---

# Aerly design integration plan

This plan maps the **Aerly Cinematic** demo design spec onto our existing Next.js 14 (App Router) passenger app. The data layer (TanStack Query hooks, `lib/api.ts` mock/real switch, `@aerly/shared` types, auth token flow) is **kept exactly as-is** — only the presentation layer (globals.css, tailwind tokens, components, page JSX) changes.

A few reconciliations up front, since the demo and our app differ:

- The demo is **English + gold/cinematic**; our app is **Romanian + blue/clean**. We adopt the gold cinematic *visual system* but keep our **Romanian copy** and our **existing routes/data**.
- The demo invents several screens we don't have (Hotels, Compensation, Help wizard, Trips list, rich Trip Detail). We **do not build those routes** — we map the demo's *trip detail* visuals onto our existing `/d/[id]` disruption page, and reuse the demo's component vocabulary where our screens already exist.
- The demo uses two fonts (Instrument Serif + Hanken Grotesk); we currently load only Inter. We add the two demo fonts and keep Inter as the ultimate fallback.
- Our app is email/password + phone-OTP auth with a `dev` mock method. The demo's "Orange Number Verification / no-SMS" flow is **cosmetic only** — we keep our real OTP challenge flow and just restyle it.

---

## 1. Design tokens to adopt

### 1a. Google Fonts to load

Replace the single Inter import in `app/layout.tsx` with `next/font/google`:

- `Instrument_Serif` (weights 400; italic 400) → CSS var `--font-display`. Used for headlines, hero copy, wordmark.
- `Hanken_Grotesk` (weights 400/500/600/700) → CSS var `--font-sans`. Used for all body/UI.
- Keep `Inter` only as a fallback inside the font stack (optional; can be dropped).

`<html>` gets `${hanken.variable} ${instrument.variable}`. `themeColor` in `viewport` changes from `#2563eb` to the cinematic dark `#1d1610` (or the gold `#C8A24E`).

### 1b. `app/globals.css` — `:root` variables

Replace the current blue/slate tokens with the cinematic palette. Keep the channel/RGB convention (`R G B` triplets) so Tailwind's `<alpha-value>` keeps working, **and** add raw hex/rgba vars for the warm tones that are used directly in inline gradients.

Core palette (channel form, for Tailwind alpha):
```
--color-accent:        200 162 78    /* #C8A24E primary gold */
--color-accent-deep:   168 132 47    /* #A8842F */
--color-accent-soft:   228 203 137   /* #E4CB89 */
--color-sky:           156 196 228   /* #9CC4E4 */
--color-sky-deep:       91 143 191   /* #5B8FBF */
--color-sky-ink:        46  92 130   /* #2E5C82 */
--color-espresso:       43  34  24   /* #2B2218 text */
--color-warm-ink:       74  63  49   /* #4A3F31 */
--color-warm-muted:    140 124 102   /* #8C7C66 */
--color-warm-faint:    180 164 136   /* #B4A488 */
--color-ivory:         251 246 236   /* #FBF6EC */
--color-cream:         244 236 221   /* #F4ECDD */
```

Keep our **risk tokens** but re-map them onto the demo's status palette so `RISK_META` / `RiskBadge` keep working unchanged:
```
--color-risk-low:      34 197 94     /* #22c55e on-time green */
--color-risk-moderate: 200 162 78    /* #c8a24e at-risk gold (was amber) */
--color-risk-high:    249 115 22     /* #f97316 delayed orange */
--color-risk-critical: 239 68 68     /* #ef4444 cancelled red */
```
Rename intent: `primary` (blue) → keep the var name `--color-primary` but point it at the gold accent (`200 162 78`) so every existing `bg-primary`/`text-primary` class instantly re-skins to gold without touching ~40 call sites. (Phase 0 trick — see implementation order.)

Direct-use rgba vars (for inline gradients/shadows that can't be alpha-classed):
```
--line: rgba(74,63,49,0.16)
--glass-bg: rgba(255,255,255,0.52)
--glass-strong-bg: rgba(251,246,236,0.88)
--appbar-bg: rgba(255,253,247,0.88)
--bottomnav-bg: rgba(255,253,247,0.92)
--gold-border: rgba(200,162,78,0.22)
--gold-border-strong: rgba(200,162,78,0.38)
```

Body background → the dark cinematic radial only on the *frame backdrop*, with the phone surface staying the cream gradient (see component plan, AppFrame).

### 1c. `tailwind.config.ts` — `extend`

Add to `theme.extend`:

- **colors**: `accent` (50–900 scale from the spec), `sky` (50/100/600/900), `espresso`, `warm-ink`, `warm-muted`, `warm-faint`, `ivory`, `cream`, all via `rgb(var(--color-…) / <alpha-value>)`. Keep `primary` + `risk.*` aliases.
- **fontFamily**: `sans: ["var(--font-sans)", …]`, `display: ["var(--font-display)", "serif"]`.
- **borderRadius**: `button: 16px`, `card: 22px`, `input: 16px`, `otp: 14px`, `icon: 12px`.
- **backdropBlur**: `glass: 18px`, `sm: 8px`, `lg: 14px`, `xl: 20px`.
- **spacing**: `safe-top: 50px`, `safe-bottom: 22px`.
- **boxShadow**: `glass: 0 10px 30px rgba(33,24,14,0.10)`, `gold-button: …`, `ivory-button: …` (exact strings from §5/§9 of the spec).
- **transitionDuration**: `120/150/180`. **transitionTimingFunction**: `cinematic: cubic-bezier(.2,.7,.2,1)`.
- **keyframes/animation**: `cFade`, `cFadeUp`, `cScaleIn`, `hintBob`, `shimmer`, `spin`, `ringDraw2`, `drawCheck2` (from §7). Expose as `animate-fade-up`, `animate-scale-in`, etc.

Add a global `@media (prefers-reduced-motion: reduce)` rule in globals.css per §7.

---

## 2. Screen mapping table

| Demo screen (spec section) | Our route / file | Data hooks / types it binds to | What changes |
|---|---|---|---|
| Cinematic **Landing / login** (phone-first hero) | `app/onboarding/login/page.tsx` | `loginEmail` + `setTokens` (`LoginInput`, `TokenResponse`) | Keep email/pw form & logic. Restyle to cinematic: cream card, `Instrument Serif` H1 "Bine ai revenit.", gold CButton, "Intră cu numărul" → phone link. Optional parallax hero image is **deferred** (no asset); use the dark radial + wordmark instead. |
| Onboarding **Phone Entry** | `app/onboarding/phone/page.tsx` | `startPhoneVerification` (`PhoneStartResponse`); sessionStorage challenge | Keep RO validation + normalize. Swap the inline phone input for the new `PhoneField` primitive (🇷🇴 +40 prefix), gold focus ring, `CLabel`. Copy stays RO. |
| Onboarding **Verify (OTP)** | `app/onboarding/verify/page.tsx` | `verifyOtp` (`TokenResponse`); `aerly_method === "dev"` | Replace single tracking-spaced input with **6-cell OTP grid** primitive that emits the same 6-digit string into existing `onChange`/`submit`. Keep dev-code hint, resend timer (cosmetic). Phase A "Orange/no-SMS" auto-advance = **skip** (we have a real challenge). |
| Onboarding **Channel prefs** (Screen 4) | *No route today* | n/a | **Defer / optional.** If built later, lives at `app/onboarding/channels/page.tsx`; channels are currently hard-coded in profile. Out of scope for re-skin. |
| **Create account / Register** | `app/onboarding/register/page.tsx` | `register` (`RegisterInput`, `PhoneStartResponse`) | Restyle to cinematic form card; keep all 4 fields + validation + challenge handoff. |
| **My Trips list** (home) | `app/(passenger)/page.tsx` | `usePnrs("active")` → `PnrWithFlight[]`; `disruptionId` for at-risk | Restyle to cinematic. Filter chips ("Active/Trecute/Toate") map to `usePnrs(status)` — we already have `PnrStatus`. Section header + count badge. Cards → new `GoldCard`/`TripCard`. Bell + red dot kept (driven by `atRiskCount`). |
| **Trip Detail** hero + risk + weather + alternatives (the demo's richest screen) | `app/(passenger)/d/[id]/page.tsx` | `useDisruption(id)` → `Disruption` (`flight`, `risk`, `severity`); `useAlternatives(id)` → `Alternative[]`; `useSelectAlternative` | Biggest visual upgrade. Hero `GoldCard(elevated)` from `flight` + `RiskMeter`. **Cancellation risk bar** ← `risk.probability`/`riskPercent`. **Weather risk panel** (dark blue, 3 gauges) — bind `Fog Risk` to `risk.probability`; `Bad Weather`/`Overall` are not in our types → render only Fog, or show static placeholders flagged "demo". `AlternativeCard` restyled (gold). Confirm/success modals → cinematic + `CRing`. Copy stays RO. |
| **Add flight** (search) | `app/(passenger)/flights/add/page.tsx` | `useFlightSearch` (`FlightSummary[]`), `useAddPnr` (`CreatePnrInput`) | Restyle search input → `TextField` primitive with `MapPin`/`Search` icon; result rows → gold list cards; empty state restyled. Logic untouched. |
| **Profile** | `app/(passenger)/profile/page.tsx` | `clearTokens` + router; static channels array | Restyle to cinematic profile: avatar gradient + gold border, glass `PRow` rows, sectioned cards (Personal / Travel / Account / Log out). Demo's blue-navy profile theme → we keep the warm cream theme for consistency. Channels stay static for now. |
| **Notifications** | `app/(passenger)/notifications/page.tsx` | `usePnrs("active")`, `RiskBadge`, `formatDateTime` | Restyle alert rows to gold glass cards; keep `RiskBadge`, link to `/d/{disruptionId}`. |
| **AppBar** (CAppBar) | `components/passenger/app-bar.tsx` | n/a | Add `subtitle` prop, safe-top height, gold-glass bg, 34×34 gold back button. |
| **Bottom Nav** (CBottomNav) | `components/passenger/bottom-nav.tsx` | `usePathname` | Restyle to gold-glass, active icon chip, safe-bottom. Keep our 3 tabs (Acasă/Notificări/Profil) — demo's 5 tabs (Trips/Help/Hotels) reference routes we don't have. |
| Hotels / Compensation / Help wizard (NEW features) | *No routes* | n/a | **Out of scope.** Document as future; do not scaffold. |

---

## 3. Component plan (shared primitives to build)

Build these under `components/ui/` (cinematic primitives) and `components/passenger/` (composed). All use `cn()` + `cva()` per our existing conventions, forward refs on interactive elements, and use Tailwind tokens from §1 (no inline styles except dynamic widths/gradients).

**New primitives (`components/ui/`):**

1. **`CButton`** — `cva` variants `gold | ivory | glass | ghost`, sizes `md(h-14)/lg(h-16)`, `full` prop, optional right icon, `active:scale-[0.98]`, `disabled:opacity-50`. Replaces the repeated `bg-primary py-3.5…` button markup across login/register/phone/verify/add.
2. **`GoldCard`** — props `active`, `elevated`, `interactive`. Standard glass (`bg-white/52` + blur-glass + `border-gold`) vs strong (`bg-ivory/88` + `border-gold-strong`). `rounded-card`, `shadow-glass`. Used by home cards, disruption hero, profile sections, notifications.
3. **`StatusPill` / restyle `RiskBadge`** — `RiskBadge` already exists and reads `RISK_META`; since we re-map `RISK_META` colors in §1b, it auto-reskins. Add a generic `StatusPill` (pill + before-dot) for non-risk statuses if needed.
4. **`TextField`** — `h-[58px]`, `rounded-input`, 2px border default `accent-200/30` → focus `accent-400`, gold focus ring shadow, optional left icon. Used by Add-flight search, register fields, compensation later.
5. **`PhoneField`** — left 🇷🇴 +40 country button + `border-r`, numeric input. Used by phone + register. Wraps existing normalize/validation (validation stays in page).
6. **`OtpInput`** — 6 cells, `flex gap-2`, each `h-[62px] rounded-otp`, auto-advance/backspace/paste, emits the joined 6-digit string. Drop-in for verify page's `onChange(value)`.
7. **`CLabel`** — uppercase 11px bold, `tracking-[0.14em]`, `text-accent-700/60`.
8. **`FilterChips`** — horizontal scroll row; active = gold gradient + shadow, inactive = `bg-white/60` + blur. Single-select; emits selected value (home uses it to switch `PnrStatus`).
9. **`CWord`** (wordmark) — icon circle + display-font "Aerly". Light + dark variants. For onboarding hero / appbar brand.
10. **`CRing`** — animated success ring + checkmark SVG (`ringDraw2`/`drawCheck2`). Replaces `CheckCircle2` in the disruption success modal and the verify success state.
11. **`GoldDivider`** — 1px gradient divider.

**Composed / refactored (`components/passenger/`):**

12. **`AppFrame`** (in `(passenger)/layout.tsx`) — outer dark radial backdrop + inner `max-w-md` cream-gradient phone surface, safe-top/safe-bottom. Wraps AuthGuard + content + BottomNav.
13. **`AppBar`** — extend with `subtitle`, gold-glass, safe-top.
14. **`BottomNav`** — gold-glass, active chip.
15. **`TripCard`** — refactor of `FlightCard`: status badge row + date, optional at-risk alert banner, `RouteDisplay`, times/airline row, "Vezi alternative" gold button. Binds `PnrWithFlight`.
16. **`RouteDisplay`** — IATA codes + city + plane divider; `big` variant for the disruption hero. Binds `FlightSummary` (`originIata/originCity/destinationIata/destinationCity`).
17. **`CancellationRiskBar`** + **`WeatherRiskPanel`/`RiskGauge`** — for `/d/[id]`. Bind `CurrentRisk.probability` via `riskPercent`. Gauges beyond "fog" are placeholders (our types only carry one probability).
18. **`AlternativeCard`** — restyle existing; keep `ALTERNATIVE_META`, `formatCost/Duration/Time`, `score`, `onSelect`, `pending`.
19. **`PRow`** — profile row (icon badge + label + value + chevron).

**`lib/format.ts` touch-ups (data-safe):** update `ALTERNATIVE_META.chip` classes to gold/sky tints; `RISK_META` labels unchanged (Romanian), only the Tailwind color *tokens* shift via globals.css. No type/shape changes.

---

## 4. Step-by-step implementation order

Each phase compiles and is shippable; the data/auth/ML layer is never touched.

**Phase 0 — Token swap (zero component edits).**
1. Edit `app/globals.css`: replace `:root` vars per §1b. Crucially, repoint `--color-primary` to the gold channel and re-map `--color-risk-*` to the demo status palette. Add direct rgba vars, reduced-motion rule, and set the body backdrop.
2. Edit `tailwind.config.ts`: add accent/sky/warm colors, `fontFamily.display`, radius/blur/spacing/shadow/duration/keyframe extensions (§1c).
3. Edit `app/layout.tsx`: load `Instrument_Serif` + `Hanken_Grotesk`, wire `--font-display`/`--font-sans`, update `themeColor`.
   → *Result:* the whole app instantly re-skins to gold/cream with new fonts, no JSX changed. Verify nothing breaks (`pnpm build`/lint).

**Phase 1 — Frame & chrome.**
4. Build `AppFrame` and update `(passenger)/layout.tsx` (dark backdrop + cream surface + safe areas).
5. Restyle `AppBar` (add `subtitle`, gold-glass) and `BottomNav` (gold-glass + active chip). These propagate to every passenger screen.

**Phase 2 — Shared primitives.**
6. Build `CButton`, `GoldCard`, `CLabel`, `GoldDivider`, `TextField`, `PhoneField`, `OtpInput`, `FilterChips`, `CWord`, `CRing` under `components/ui/`. Unit-render in isolation (Storybook-less: a temporary `/__kit` page is optional). No page wiring yet.

**Phase 3 — Onboarding screens (auth logic untouched).**
7. `phone/page.tsx`: swap inline phone input → `PhoneField` + `CLabel` + `CButton`; keep `normalize`/`RO_MOBILE`/`startPhoneVerification`/sessionStorage exactly.
8. `verify/page.tsx`: swap the single input → `OtpInput` feeding the existing `onChange→submit(digits)`; keep `verifyOtp`/`setTokens`/dev hint.
9. `login/page.tsx` + `register/page.tsx`: wrap in `GoldCard`, `Instrument Serif` H1s, `CButton`/`TextField`; keep `loginEmail`/`register` + validation.

**Phase 4 — Home (Trips).**
10. Refactor `FlightCard` → `TripCard` (+`RouteDisplay`, restyled `RiskBadge`/status pill, at-risk banner, gold "Vezi alternative"). Keep `PnrWithFlight` props and the `/d/{disruptionId}` link.
11. `(passenger)/page.tsx`: add `FilterChips` driving `usePnrs(status)` (status already a typed param), section header + count badge, gold "Adaugă zbor" CTA. Keep `usePnrs`, loading skeletons, error/empty states.

**Phase 5 — Disruption / alternatives (richest screen).**
12. `(passenger)/d/[id]/page.tsx`: rebuild hero with `GoldCard(elevated)` + big `RouteDisplay` + `RiskMeter`, bound to `useDisruption`. Add `CancellationRiskBar` + `WeatherRiskPanel`(fog gauge real, others placeholder) from `risk.probability`.
13. Restyle `AlternativeCard` (gold) — keep `useAlternatives`, `useSelectAlternative`, `confirm()`, `actionUrl` window.open.
14. Replace confirm/success modals with cinematic glass sheets; success uses `CRing`. Keep RO copy and the existing select-mutation flow.

**Phase 6 — Add flight, Profile, Notifications.**
15. `flights/add/page.tsx`: `TextField` search + gold result cards + restyled empty/error. Keep `useFlightSearch`/`useAddPnr`/`useDebounce`.
16. `profile/page.tsx`: avatar + `GoldCard` sections + `PRow`. Keep `clearTokens`/logout; channels stay static.
17. `notifications/page.tsx`: gold glass alert cards; keep `usePnrs`, `RiskBadge`, `/d/{id}` links.

**Phase 7 — Polish & verify.**
18. Add `animate-fade-up`/`animate-scale-in` mount animations per screen; verify `prefers-reduced-motion`.
19. Re-run with mocks (`USE_MOCKS`, no env) to confirm full clickthrough, then with `NEXT_PUBLIC_API_URL` set to confirm the real path is byte-identical at the data layer.
20. Lint/build; manual pass at 320px / 375px widths.

**Explicitly deferred (do not build now):** Hotels, Compensation calculator, Help wizard, Channel-prefs onboarding screen, parallax hero image (no asset), and the demo's 5-tab nav. Document these as follow-ups; none have backing types in `@aerly/shared` or endpoints in `lib/api.ts`.

**Key relevant files:**
- Tokens: `E:/Projects/Airhack/apps/web/app/globals.css`, `E:/Projects/Airhack/apps/web/tailwind.config.ts`, `E:/Projects/Airhack/apps/web/app/layout.tsx`
- Frame/chrome: `E:/Projects/Airhack/apps/web/app/(passenger)/layout.tsx`, `E:/Projects/Airhack/apps/web/components/passenger/app-bar.tsx`, `E:/Projects/Airhack/apps/web/components/passenger/bottom-nav.tsx`
- Screens: `E:/Projects/Airhack/apps/web/app/(passenger)/page.tsx`, `E:/Projects/Airhack/apps/web/app/(passenger)/d/[id]/page.tsx`, `E:/Projects/Airhack/apps/web/app/(passenger)/flights/add/page.tsx`, `E:/Projects/Airhack/apps/web/app/(passenger)/profile/page.tsx`, `E:/Projects/Airhack/apps/web/app/(passenger)/notifications/page.tsx`, `E:/Projects/Airhack/apps/web/app/onboarding/{login,register,phone,verify}/page.tsx`
- Components to refactor/build on: `E:/Projects/Airhack/apps/web/components/passenger/{flight-card,alternative-card,risk-meter,empty-state}.tsx`, `E:/Projects/Airhack/apps/web/components/shared/risk-badge.tsx`
- Data layer (DO NOT change shape): `E:/Projects/Airhack/apps/web/lib/api.ts`, `E:/Projects/Airhack/apps/web/lib/format.ts`, `E:/Projects/Airhack/apps/web/hooks/{use-pnrs,use-disruption,use-flights,use-debounce}.ts`, `E:/Projects/Airhack/packages/shared/index.ts`