"use client";

import type { Alternative } from "@aerly/shared";
import { ArrowRight, Clock, ExternalLink, Wallet } from "lucide-react";

import { GoldCard } from "@/components/ui/card";
import {
  ALTERNATIVE_META,
  formatCost,
  formatDuration,
  formatTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";

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
        onClick={() => onSelect(alternative)}
        disabled={pending}
        className={cn(
          "mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-button text-sm font-semibold tracking-tight transition-all duration-150 ease-cinematic active:scale-[0.98] disabled:opacity-50",
          recommended
            ? "bg-gradient-to-br from-accent-soft via-accent to-accent-deep border border-[rgba(217,189,116,0.9)] text-espresso shadow-gold-button"
            : "border border-[color:var(--gold-border-strong)] bg-white/60 text-accent-deep backdrop-blur-lg",
        )}
      >
        {alternative.actionLabel}
        {recommended ? (
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} />
        )}
      </button>
    </GoldCard>
  );
}
