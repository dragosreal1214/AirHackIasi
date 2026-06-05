import type { PnrWithFlight } from "@aerly/shared";
import { ArrowRight, Plane } from "lucide-react";
import Link from "next/link";

import { RiskBadge } from "@/components/shared/risk-badge";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FlightCard({ pnr }: { pnr: PnrWithFlight }) {
  const { flight, currentRisk, disruptionId } = pnr;
  const atRisk = Boolean(disruptionId);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        atRisk ? "border-risk-high/40" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Plane className="h-3.5 w-3.5" />
            {flight.airlineName} · {flight.flightNumber}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            {flight.originIata}
            <ArrowRight className="h-4 w-4 text-slate-400" />
            {flight.destinationIata}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatDateTime(flight.scheduledDeparture)}
          </p>
        </div>
        {currentRisk && <RiskBadge level={currentRisk.level} />}
      </div>

      {atRisk && (
        <Link
          href={`/d/${disruptionId}`}
          className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-risk-high/10 py-2.5 text-sm font-semibold text-risk-high"
        >
          Vezi alternative
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function FlightCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
      <div className="h-3 w-28 rounded bg-slate-100" />
      <div className="mt-3 h-6 w-32 rounded bg-slate-100" />
      <div className="mt-2 h-4 w-40 rounded bg-slate-100" />
    </div>
  );
}
