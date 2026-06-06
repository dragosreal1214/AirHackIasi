"use client";

import {
  ArrowRight,
  Banknote,
  BedDouble,
  Calculator,
  CheckCircle2,
  ExternalLink,
  Phone,
  PlaneTakeoff,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/divider";
import { cn } from "@/lib/utils";

const SUPPORT_TEL = "+40312295500";
const SUPPORT_TEL_LABEL = "+40 31 229 5500";

/* ── Step 1: ce s-a întâmplat ───────────────────────────────────── */
type Issue = "cancelled" | "delayed" | "denied" | "missed";

const ISSUES: { value: Issue; label: string; hint: string; icon: LucideIcon }[] = [
  {
    value: "cancelled",
    label: "Anulat",
    hint: "Zborul a fost anulat de operator.",
    icon: PlaneTakeoff,
  },
  {
    value: "delayed",
    label: "Întârziat 3h+",
    hint: "Ai ajuns cu peste 3 ore mai târziu.",
    icon: RotateCcw,
  },
  {
    value: "denied",
    label: "Refuz la îmbarcare",
    hint: "Ți s-a refuzat îmbarcarea (overbooking).",
    icon: Banknote,
  },
  {
    value: "missed",
    label: "Pierdut legătura",
    hint: "Ai ratat conexiunea din vina operatorului.",
    icon: ArrowRight,
  },
];

/* ── Step 2: distanța rutei ─────────────────────────────────────── */
type Band = "short" | "medium" | "long";

const BANDS: {
  value: Band;
  label: string;
  hint: string;
  examples: string;
}[] = [
  {
    value: "short",
    label: "Sub 1500 km",
    hint: "Curse interne și regionale.",
    examples: "OTP → CLJ · OTP → BBU · București → Viena",
  },
  {
    value: "medium",
    label: "1500–3500 km",
    hint: "Rute intra-UE de distanță medie.",
    examples: "OTP → Londra · OTP → Paris · OTP → Madrid",
  },
  {
    value: "long",
    label: "Peste 3500 km",
    hint: "Rute lungi, în afara UE.",
    examples: "OTP → New York · OTP → Dubai",
  },
];

/* ── Compensația EU261 după distanță ────────────────────────────── */
const COMPENSATION: Record<Band, { amount: string; note: string }> = {
  short: {
    amount: "250 €",
    note: "Pentru zboruri de până la 1500 km.",
  },
  medium: {
    amount: "400 €",
    note: "Pentru zboruri intra-UE peste 1500 km și alte rute 1500–3500 km.",
  },
  long: {
    amount: "600 €",
    note: "Pentru zboruri peste 3500 km, în afara UE.",
  },
};

/* ── Pașii recomandați după tipul problemei ─────────────────────── */
const STEPS_BY_ISSUE: Record<Issue, { title: string; steps: string[] }> = {
  cancelled: {
    title: "Zbor anulat",
    steps: [
      "Cere operatorului redirecționare gratuită sau rambursarea integrală a biletului.",
      "Păstrează cardul de îmbarcare și orice dovadă a anulării (email, SMS).",
      "Dacă anularea a fost anunțată cu sub 14 zile înainte, ai dreptul la compensație.",
    ],
  },
  delayed: {
    title: "Întârziere de 3 ore sau mai mult",
    steps: [
      "Notează ora reală de sosire — contează diferența la destinația finală.",
      "Cere mâncare, băutură și, dacă e cazul, cazare pe cheltuiala operatorului.",
      "Întârzierea de peste 3 ore îți dă dreptul la compensație EU261.",
    ],
  },
  denied: {
    title: "Refuz la îmbarcare",
    steps: [
      "Refuză voluntariatul dacă nu primești o ofertă corectă de compensare.",
      "Cere redirecționare sau rambursare, plus asistență (masă, cazare).",
      "Refuzul involuntar la îmbarcare îți dă drept la compensație imediată.",
    ],
  },
  missed: {
    title: "Legătură pierdută",
    steps: [
      "Confirmă că biletele erau pe aceeași rezervare (un singur PNR).",
      "Cere reprogramare pe următoarea cursă disponibilă spre destinația finală.",
      "Dacă întârzierea la destinație depășește 3 ore, ai dreptul la compensație.",
    ],
  },
};

type Stage = 1 | 2 | 3;

export default function HelpPage() {
  const [stage, setStage] = useState<Stage>(1);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [band, setBand] = useState<Band | null>(null);

  function reset() {
    setIssue(null);
    setBand(null);
    setStage(1);
  }

  function pickIssue(v: Issue) {
    setIssue(v);
    setStage(2);
  }

  function pickBand(v: Band) {
    setBand(v);
    setStage(3);
  }

  const comp = band ? COMPENSATION[band] : null;
  const plan = issue ? STEPS_BY_ISSUE[issue] : null;

  return (
    <>
      <AppBar title="Ajutor" subtitle="Ghid pentru perturbări" backHref="/" />
      <div className="px-4 pb-12 pt-5">
        {/* progress */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            aria-label="Reîncepe"
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border-strong)] bg-white/60 text-accent-deep backdrop-blur-lg transition-transform duration-120 ease-cinematic active:scale-95",
              stage === 1 && "pointer-events-none opacity-40",
            )}
          >
            <RotateCcw className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </button>
          <div className="flex flex-1 gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  s <= stage ? "bg-accent" : "bg-warm-faint/30",
                )}
              />
            ))}
          </div>
        </div>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep/70">
          Pasul {stage} din 3
        </p>

        {/* ── STEP 1 ──────────────────────────────────────────── */}
        {stage === 1 && (
          <div key="s1" className="animate-c-fade-up">
            <h2 className="mt-2 font-display text-[28px] leading-tight tracking-tight text-espresso">
              Ce s-a întâmplat cu zborul tău?
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-warm-muted">
              Alege situația și îți spunem ce poți cere și la cât ai dreptul.
            </p>

            <div className="mt-6 space-y-3">
              {ISSUES.map((opt, i) => {
                const Icon = opt.icon;
                const active = issue === opt.value;
                return (
                  <GoldCard
                    key={opt.value}
                    interactive
                    active={active}
                    onClick={() => pickIssue(opt.value)}
                    className="flex animate-c-fade-up items-center gap-3 p-4"
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border)] bg-accent/[0.12] text-accent-deep shadow-glass">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold leading-snug tracking-tight text-espresso">
                        {opt.label}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium leading-snug text-warm-muted">
                        {opt.hint}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-5 w-5 flex-shrink-0 text-accent-deep"
                      strokeWidth={2.2}
                    />
                  </GoldCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────── */}
        {stage === 2 && (
          <div key="s2" className="animate-c-fade-up">
            <h2 className="mt-2 font-display text-[28px] leading-tight tracking-tight text-espresso">
              Pe ce rută?
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-warm-muted">
              Distanța zborului decide valoarea compensației EU261.
            </p>

            <div className="mt-6 space-y-3">
              {BANDS.map((opt, i) => {
                const active = band === opt.value;
                return (
                  <GoldCard
                    key={opt.value}
                    interactive
                    active={active}
                    onClick={() => pickBand(opt.value)}
                    className="animate-c-fade-up p-4"
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border)] bg-accent/[0.12] text-accent-deep shadow-glass">
                        <span className="font-display text-[15px] leading-none text-accent-deep">
                          {COMPENSATION[opt.value].amount}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold leading-snug tracking-tight text-espresso">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium leading-snug text-warm-muted">
                          {opt.hint}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-5 w-5 flex-shrink-0 text-accent-deep"
                        strokeWidth={2.2}
                      />
                    </div>
                    <p className="mt-2.5 text-[11px] font-medium leading-snug text-warm-faint">
                      {opt.examples}
                    </p>
                  </GoldCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: REZULTAT ────────────────────────────────── */}
        {stage === 3 && plan && comp && (
          <div key="s3" className="animate-c-fade-up">
            <h2 className="mt-2 font-display text-[28px] leading-tight tracking-tight text-espresso">
              {plan.title}
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-warm-muted">
              Iată ce poți face acum și la ce ai dreptul.
            </p>

            {/* Entitlement summary */}
            <GoldCard
              elevated
              className="mt-6 animate-c-scale-in p-5 text-center"
              style={{ animationDelay: "60ms" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep/70">
                Compensație estimată EU261
              </p>
              <p className="mt-1.5 font-display text-5xl leading-none tracking-tight text-espresso">
                {comp.amount}
              </p>
              <p className="mx-auto mt-3 max-w-[18rem] text-xs font-medium leading-relaxed text-warm-muted">
                {comp.note}
              </p>
              <p className="mt-2 text-[11px] font-medium leading-relaxed text-warm-faint">
                Estimare orientativă. Suma finală depinde de cauza perturbării și de
                circumstanțele extraordinare.
              </p>
            </GoldCard>

            {/* Recommended steps */}
            <GoldCard
              className="mt-4 animate-c-fade-up p-5"
              style={{ animationDelay: "140ms" }}
            >
              <h3 className="font-display text-xl leading-tight tracking-tight text-espresso">
                Pașii recomandați
              </h3>
              <GoldDivider className="my-3.5" />
              <ol className="space-y-3.5">
                {plan.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[var(--gold-border)] bg-accent/[0.12] text-[12px] font-bold text-accent-deep">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-warm-ink">
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
            </GoldCard>

            {/* CTAs */}
            <div
              className="mt-5 animate-c-fade-up space-y-3"
              style={{ animationDelay: "220ms" }}
            >
              <Link
                href="/compensation"
                className="block transition-transform duration-120 ease-cinematic active:scale-[0.98]"
              >
                <CButton
                  variant="gold"
                  full
                  rightIcon={<Calculator className="h-[18px] w-[18px]" strokeWidth={2.2} />}
                >
                  Calculează exact
                </CButton>
              </Link>
              <Link
                href="/hotels"
                className="block transition-transform duration-120 ease-cinematic active:scale-[0.98]"
              >
                <CButton
                  variant="ivory"
                  full
                  rightIcon={<BedDouble className="h-[18px] w-[18px]" strokeWidth={2.2} />}
                >
                  Vezi cazare
                </CButton>
              </Link>
              <a
                href="https://www.airhelp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform duration-120 ease-cinematic active:scale-[0.98]"
              >
                <CButton
                  variant="ivory"
                  full
                  rightIcon={<ExternalLink className="h-[18px] w-[18px]" strokeWidth={2.2} />}
                >
                  Cere despăgubirea cu AirHelp
                </CButton>
              </a>
            </div>

            {/* Contact suport */}
            <GoldCard
              className="mt-5 animate-c-fade-up p-5 text-center"
              style={{ animationDelay: "300ms" }}
            >
              <CheckCircle2
                className="mx-auto h-7 w-7 text-accent-deep"
                strokeWidth={2}
              />
              <h3 className="mt-2 font-display text-lg leading-tight tracking-tight text-espresso">
                Mai ai nevoie de ajutor?
              </h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-warm-muted">
                Echipa noastră îți răspunde non-stop, în limba română.
              </p>
              <a
                href={`tel:${SUPPORT_TEL}`}
                className="mt-4 block transition-transform duration-120 ease-cinematic active:scale-[0.98]"
              >
                <CButton
                  variant="glass"
                  full
                  className="!text-espresso"
                  rightIcon={<Phone className="h-[18px] w-[18px]" strokeWidth={2.2} />}
                >
                  Contact suport
                </CButton>
              </a>
              <p className="mt-3 text-xs font-medium text-warm-faint">
                {SUPPORT_TEL_LABEL}
              </p>
            </GoldCard>
          </div>
        )}

        <p className="mt-7 px-1 text-center text-xs font-medium text-warm-faint">
          Fogora · Copilotul tău calm.
        </p>
      </div>
    </>
  );
}
