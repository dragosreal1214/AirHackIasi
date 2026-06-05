"use client";

import type { Alternative } from "@aerly/shared";
import { ArrowRight, Clock, ExternalLink, Wallet } from "lucide-react";

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
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        recommended ? "border-primary/40 ring-1 ring-primary/20" : "border-slate-200",
      )}
    >
      {recommended && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          🥇 Recomandat
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
            meta.chip,
          )}
        >
          {meta.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {alternative.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{alternative.subtitle}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {formatTime(alternative.departure)} · {formatDuration(alternative.durationMinutes)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5 text-slate-400" />
          {formatCost(alternative.costEur)}
        </span>
        <span className="ml-auto font-semibold text-slate-700">
          Scor {alternative.score}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onSelect(alternative)}
        disabled={pending}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {alternative.actionLabel}
        {recommended ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <ExternalLink className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
