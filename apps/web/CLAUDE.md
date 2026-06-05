# Aerly Web Frontend

## Specifics for this app

- Next.js 14 App Router with TypeScript strict mode
- Mobile-first PWA targeting 375px primary, 320px minimum
- Two route groups: `(passenger)/` mobile-first, `(ops)/` desktop dashboard

> **Current state:** scaffold only. `app/page.tsx` is a placeholder landing page
> that the final design will replace. Route groups, shadcn primitives, TanStack
> Query, i18n, and PWA setup are not wired up yet — add them per the plan tasks.

## File organization

- `app/(passenger)/` — all passenger-facing pages with mobile layout
- `app/(ops)/` — ops dashboard with sidebar layout
- `app/api/` — Next.js API routes ONLY for things that need to run on Vercel (webhooks proxy)
- `components/ui/` — shadcn primitives (don't modify, use as-is)
- `components/passenger/` — passenger-specific composed components
- `components/ops/` — ops-specific composed components
- `components/shared/` — used across both
- `lib/api.ts` — API client + TanStack Query factories
- `lib/supabase.ts` — Supabase client singleton
- `hooks/` — custom React hooks
- `messages/` — i18n files (ro.json, en.json)

## Design tokens

CSS variables defined in `app/globals.css`. Tailwind config in `tailwind.config.ts` uses them.

```css
--color-primary: 37 99 235;       /* blue-600 */
--color-risk-low: 16 185 129;     /* green */
--color-risk-moderate: 245 158 11;/* amber */
--color-risk-high: 249 115 22;    /* orange */
--color-risk-critical: 220 38 38; /* red */
```

Always use Tailwind classes. Never inline styles unless dynamic (e.g., progress bar width).

## Component patterns

- Use `cn()` from `lib/utils` for conditional classes
- Forward refs on all interactive primitives
- Variants via `cva()` (class-variance-authority)
- Loading states: skeleton, not spinner
- Empty states: illustration + headline + CTA

## Realtime subscriptions

For ops dashboard, use `useRealtimeUpdates` hook (in `hooks/`). Don't manually subscribe to Supabase channels in components.
