import type { PnrWithFlight } from "@aerly/shared";
import { ArrowRight, Calendar, Plane, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { RouteDisplay } from "@/components/passenger/route-display";
import { RiskBadge } from "@/components/shared/risk-badge";
import { GoldCard } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/format";

export function FlightCard({ pnr }: { pnr: PnrWithFlight }) {
  const { flight, currentRisk, disruptionId } = pnr;
  const atRisk = Boolean(disruptionId);

  return (
    <Link href={`/trips/${flight.id}`} className="block">
    <GoldCard
      active={atRisk}
      interactive
      className="animate-c-fade-up overflow-hidden p-5"
    >
      {/* Status pill row + date */}
      <div className="flex items-center justify-between gap-3">
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
        <div className="flex items-center gap-1.5 text-xs font-medium text-warm-muted">
          <Plane className="h-3.5 w-3.5" />
          {flight.airlineName} · {flight.flightNumber}
        </div>
      </div>

      {/* Vezi detalii */}
      <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-[color:var(--gold-border)] pt-3 text-sm font-bold tracking-tight text-accent-deep">
        Vezi detalii
        <ArrowRight className="h-4 w-4" />
      </div>
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
