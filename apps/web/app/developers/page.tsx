import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fogora API — Fog Predictor for developers",
  description:
    "Predict airport fog from weather features with the Fogora XGBoost model. Public REST API + docs.",
};

const API = process.env.NEXT_PUBLIC_API_URL || "";

const ENDPOINTS = [
  { method: "GET", path: "/api/public/v1/predict", desc: "Fog probability from weather features" },
  { method: "POST", path: "/api/public/v1/predict/batch", desc: "Up to 100 rows at once" },
  { method: "GET", path: "/api/public/v1/forecast?airport=IAS", desc: "Live hourly fog-risk timeline" },
  { method: "GET", path: "/api/public/v1/airports/{iata}/risk", desc: "B2B: per-flight risk board for an airport" },
  { method: "GET", path: "/api/public/v1/airports", desc: "Supported airports" },
  { method: "GET", path: "/api/public/v1/model", desc: "Model metadata + thresholds" },
];

const LEVELS = [
  { l: "low", p: "< 25%", c: "text-risk-low" },
  { l: "moderate", p: "25–55%", c: "text-risk-moderate" },
  { l: "high", p: "55–90%", c: "text-risk-high" },
  { l: "critical", p: "≥ 90%", c: "text-risk-critical" },
];

export default function DevelopersPage() {
  return (
    <main className="cine-surface min-h-screen px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-button border border-[color:var(--gold-border-strong)] bg-white/60 px-4 py-2 text-sm font-semibold text-accent-deep transition-transform duration-120 ease-cinematic hover:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Înapoi în aplicație
        </Link>
        <div className="flex items-center gap-3">
          <img src="/cine/fogora-mark-256.png" alt="Fogora" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="font-display text-4xl leading-none tracking-tight text-espresso">
              Fogora API
            </h1>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-accent-deep/70">
              Fog Predictor · for developers
            </p>
          </div>
        </div>

        <p className="mt-6 text-lg leading-relaxed text-warm-muted">
          Predict airport fog from weather features using the same XGBoost model that
          powers Fogora — trained on ~2 years of METAR at Iași (LRIA), ROC-AUC ≈ 0.99.
          A simple REST API: send the conditions, get a fog probability + risk level.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`${API}/docs`}
            className="inline-flex h-12 items-center rounded-button bg-gradient-to-br from-accent-soft via-accent to-accent-deep px-6 text-sm font-semibold tracking-tight text-espresso shadow-gold-button"
          >
            Interactive docs (Swagger) →
          </a>
          <a
            href={`${API}/api/public/v1/model`}
            className="inline-flex h-12 items-center rounded-button border border-[color:var(--gold-border-strong)] bg-white/60 px-6 text-sm font-semibold tracking-tight text-accent-deep"
          >
            Model metadata
          </a>
        </div>

        <h2 className="mt-12 font-display text-2xl tracking-tight text-espresso">Endpoints</h2>
        <div className="mt-4 overflow-hidden rounded-card border border-[color:var(--gold-border)] bg-white/55">
          {ENDPOINTS.map((e, i) => (
            <div
              key={e.path}
              className={
                "flex flex-wrap items-center gap-3 px-4 py-3 " +
                (i < ENDPOINTS.length - 1 ? "border-b border-[color:var(--gold-border)]" : "")
              }
            >
              <span className="inline-flex w-14 justify-center rounded-full bg-accent/[0.14] px-2 py-0.5 text-[11px] font-bold text-accent-deep">
                {e.method}
              </span>
              <code className="text-sm font-semibold text-espresso">{e.path}</code>
              <span className="ml-auto text-xs text-warm-muted">{e.desc}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-display text-2xl tracking-tight text-espresso">Quick start</h2>
        <pre className="mt-4 overflow-x-auto rounded-card border border-[color:var(--gold-border)] bg-espresso px-5 py-4 text-[13px] leading-relaxed text-ivory">
          <code>{`curl -H "X-API-Key: demo" \\
  "${API || "https://<host>"}/api/public/v1/predict?temperature=2&dewpoint_depression=0&wind_speed=2&humidity=100&hour=5&month=12"

# → {"probability":0.8859,"level":"high", ...}`}</code>
        </pre>

        <h2 className="mt-10 font-display text-2xl tracking-tight text-espresso">Risk levels</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LEVELS.map((x) => (
            <div key={x.l} className="rounded-card border border-[color:var(--gold-border)] bg-white/55 p-4">
              <div className={"font-display text-xl capitalize " + x.c}>{x.l}</div>
              <div className="mt-1 text-sm font-semibold text-warm-muted">{x.p}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-warm-faint">
          Auth via an <code className="text-accent-deep">X-API-Key</code> header (open until keys are
          configured). Rate-limited at 60 req/min. Full reference: <code>docs/public-api.md</code>.
        </p>
        <p className="mt-8 text-center text-xs text-warm-faint">Fogora · Copilotul tău calm.</p>
      </div>
    </main>
  );
}
