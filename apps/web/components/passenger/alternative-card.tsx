"use client";

import type { Alternative, Leg } from "@aerly/shared";
import {
  ArrowRight,
  Bus,
  Car,
  Clock,
  ExternalLink,
  Plane,
  TrainFront,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { GoldCard } from "@/components/ui/card";
import {
  ALTERNATIVE_META,
  formatCost,
  formatDuration,
  formatTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const LEG_ICON = { bus: Bus, train: TrainFront, flight: Plane, transfer: Car } as const;

export function AlternativeCard({
  alternative,
  onSelect,
  pending,
}: {
  alternative: Alternative;
  onSelect: (alt: Alternative) => void;
  pending?: boolean;
}) {
  const meta = ALTERNATIVE_META[alternative.type];
  const recommended = alternative.rank === 1;
  const legs = alternative.legs ?? [];
  const hasLegs = legs.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <GoldCard
      elevated={recommended}
      active={recommended}
      className="animate-fade-up p-4"
    >
      {recommended && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent/[0.15] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-accent-deep">
          🥇 Recomandat
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-icon text-lg",
            meta.chip,
          )}
        >
          {meta.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-espresso">
            {alternative.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-warm-muted">
            {alternative.subtitle}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-warm-ink">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-accent-deep" strokeWidth={2} />
          {formatTime(alternative.departure)} ·{" "}
          {formatDuration(alternative.durationMinutes)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-accent-deep" strokeWidth={2} />
          {formatCost(alternative.costEur)}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/[0.12] px-2 py-0.5 font-bold text-accent-deep">
          Scor {alternative.score}
        </span>
      </div>

      <button
        type="button"
        onClick={() => (hasLegs ? setOpen(true) : onSelect(alternative))}
        disabled={pending}
        className={cn(
          "mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-button text-sm font-semibold tracking-tight transition-all duration-150 ease-cinematic active:scale-[0.98] disabled:opacity-50",
          recommended
            ? "bg-gradient-to-br from-accent-soft via-accent to-accent-deep border border-[rgba(217,189,116,0.9)] text-espresso shadow-gold-button"
            : "border border-[color:var(--gold-border-strong)] bg-white/60 text-accent-deep backdrop-blur-lg",
        )}
      >
        {hasLegs ? "Vezi pașii rerutării" : alternative.actionLabel}
        {hasLegs || recommended ? (
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} />
        )}
      </button>

      {open &&
        hasLegs &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
              className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md animate-c-fade-up rounded-t-[28px] border-t border-accent/30 bg-cream px-5 pb-safe-bottom pt-3 shadow-[0_-10px_40px_rgba(20,14,8,0.34)]">
              <div className="mx-auto mb-4 h-[5px] w-11 rounded-full bg-accent/25" />
              <h2 className="font-display text-2xl leading-tight tracking-tight text-espresso">
                {alternative.title}
              </h2>
              <p className="mt-1 text-sm text-warm-muted">
                Pașii de urmat · total {formatDuration(alternative.durationMinutes)} ·{" "}
                {formatCost(alternative.costEur)}
              </p>

              <ol className="mt-4 space-y-3">
                {legs.map((leg, i) => (
                  <LegRow key={i} index={i + 1} leg={leg} />
                ))}
              </ol>

              <button
                type="button"
                onClick={() => {
                  onSelect(alternative);
                  setOpen(false);
                }}
                disabled={pending}
                className="mt-5 flex h-12 w-full items-center justify-center gap-1.5 rounded-button border border-[rgba(217,189,116,0.9)] bg-gradient-to-br from-accent-soft via-accent to-accent-deep text-sm font-semibold tracking-tight text-espresso shadow-gold-button transition-all duration-150 ease-cinematic active:scale-[0.98] disabled:opacity-50"
              >
                Alege această rută
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <p className="mt-3 px-1 text-center text-[11px] text-warm-faint">
                Deschide fiecare link ca să rezervi segmentul respectiv.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </GoldCard>
  );
}

function LegRow({ index, leg }: { index: number; leg: Leg }) {
  const Icon = LEG_ICON[leg.mode] ?? Car;
  return (
    <li className="flex items-start gap-3 rounded-card border border-[color:var(--gold-border)] bg-white/60 p-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-icon bg-accent/[0.14] text-accent-deep">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-bold text-accent-deep">{index}.</span>
          <span className="text-sm font-bold text-espresso">{leg.title}</span>
        </div>
        {leg.detail && (
          <p className="mt-0.5 text-xs text-warm-muted">{leg.detail}</p>
        )}
        {leg.url && (
          <a
            href={leg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent-deep underline-offset-2 hover:underline"
          >
            Deschide site-ul
            <ExternalLink className="h-3 w-3" strokeWidth={2.2} />
          </a>
        )}
      </div>
      {leg.durationMinutes != null && (
        <span className="flex-shrink-0 text-[11px] font-semibold text-warm-faint">
          {formatDuration(leg.durationMinutes)}
        </span>
      )}
    </li>
  );
}
