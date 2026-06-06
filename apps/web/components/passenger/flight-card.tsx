"use client";

import type { PnrWithFlight } from "@aerly/shared";
import {
  ArrowRight,
  Calendar,
  Loader2,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AirlineBadge } from "@/components/passenger/airline-badge";
import { RouteDisplay } from "@/components/passenger/route-display";
import { RiskBadge } from "@/components/shared/risk-badge";
import { GoldCard } from "@/components/ui/card";
import { useDeletePnr } from "@/hooks/use-pnrs";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FlightCard({ pnr }: { pnr: PnrWithFlight }) {
  const { flight, currentRisk, disruptionId } = pnr;
  const atRisk = Boolean(disruptionId);

  const [confirming, setConfirming] = useState(false);
  const deletePnr = useDeletePnr();

  /** Prevent the surrounding Link from navigating when interacting with controls. */
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onConfirmDelete = (e: React.MouseEvent) => {
    stop(e);
    deletePnr.mutate(pnr.id, {
      onSettled: () => setConfirming(false),
    });
  };

  return (
    <Link href={`/trips/${flight.id}`} className="block">
    <GoldCard
      active={atRisk}
      interactive
      className="animate-c-fade-up relative overflow-hidden p-5"
    >
      {/* Delete control (corner) — does not trigger navigation */}
      <button
        type="button"
        aria-label="Șterge zborul"
        onClick={(e) => {
          stop(e);
          setConfirming(true);
        }}
        className="absolute right-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-icon text-warm-faint transition-colors duration-150 ease-cinematic hover:bg-accent/[0.1] hover:text-accent-deep active:scale-[0.94]"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* Status pill row + date */}
      <div className="flex items-center justify-between gap-3 pr-9">
        {currentRisk ? (
          <RiskBadge level={currentRisk.level} />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold-border)] bg-accent/[0.1] px-2.5 py-1 text-xs font-semibold tracking-tight text-accent-deep">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            Confirmat
          </span>
        )}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-warm-muted">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(flight.scheduledDeparture)}
        </div>
      </div>

      {/* At-risk gold banner */}
      {atRisk && (
        <div className="mt-4 flex items-center gap-2 rounded-input border border-[color:var(--gold-border-strong)] bg-accent/[0.12] px-3 py-2 text-xs font-semibold text-accent-deep">
          <TriangleAlert className="h-4 w-4 flex-shrink-0" />
          Risc de perturbare — verifică alternativele
        </div>
      )}

      {/* Route */}
      <div className="mt-4">
        <RouteDisplay flight={flight} />
      </div>

      {/* Times + airline */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[color:var(--gold-border)] pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-espresso">
            {formatTime(flight.scheduledDeparture)}
          </span>
          <ArrowRight className="h-3.5 w-3.5 self-center text-warm-faint" />
          <span className="text-base font-bold tracking-tight text-espresso">
            {formatTime(flight.scheduledArrival)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-warm-muted">
          <AirlineBadge code={flight.airlineCode} size={26} />
          {flight.airlineName} · {flight.flightNumber}
        </div>
      </div>

      {/* Footer — confirm row replaces "Vezi detalii" while confirming */}
      {confirming ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[color:var(--gold-border)] pt-3">
          <span className="text-sm font-semibold tracking-tight text-espresso">
            Ștergi acest zbor?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                setConfirming(false);
              }}
              disabled={deletePnr.isPending}
              className="rounded-button border border-[color:var(--gold-border)] px-3 py-1.5 text-xs font-semibold tracking-tight text-warm-muted transition-colors duration-150 ease-cinematic hover:text-espresso disabled:opacity-50"
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={deletePnr.isPending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-button border border-[color:var(--risk-high)] px-3 py-1.5 text-xs font-bold tracking-tight text-[color:var(--risk-high)] transition-colors duration-150 ease-cinematic hover:bg-[color:var(--risk-high)]/[0.1] disabled:opacity-50",
              )}
            >
              {deletePnr.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Șterge
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-[color:var(--gold-border)] pt-3 text-sm font-bold tracking-tight text-accent-deep">
          Vezi detalii
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </GoldCard>
    </Link>
  );
}

export function FlightCardSkeleton() {
  return (
    <div className="rounded-card border border-[color:var(--gold-border)] bg-white/[0.52] p-5 shadow-glass">
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-6 w-24 animate-shimmer rounded-full" />
        <div className="skeleton-shimmer h-4 w-20 animate-shimmer rounded" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="skeleton-shimmer h-9 w-16 animate-shimmer rounded" />
        <div className="skeleton-shimmer mx-3 h-4 flex-1 animate-shimmer rounded" />
        <div className="skeleton-shimmer h-9 w-16 animate-shimmer rounded" />
      </div>
      <div className="skeleton-shimmer mt-5 h-4 w-40 animate-shimmer rounded" />
    </div>
  );
}
