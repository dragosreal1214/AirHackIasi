"use client";

import type { PnrStatus } from "@aerly/shared";
import { Bell, PlaneTakeoff, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { EmptyState } from "@/components/passenger/empty-state";
import {
  FlightCard,
  FlightCardSkeleton,
} from "@/components/passenger/flight-card";
import { CButton } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { usePnrs } from "@/hooks/use-pnrs";

const FILTERS: { value: PnrStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Trecute" },
  { value: "cancelled", label: "Anulate" },
];

export default function TripsPage() {
  const [status, setStatus] = useState<PnrStatus>("active");
  const { data: pnrs, isLoading, isError, refetch } = usePnrs(status);
  const atRiskCount = pnrs?.filter((p) => p.disruptionId).length ?? 0;
  const count = pnrs?.length ?? 0;

  return (
    <>
      <AppBar
        title="Călătoriile tale"
        backHref="/"
        action={
          <Link
            href="/notifications"
            aria-label="Notificări"
            className="relative flex h-9 w-9 items-center justify-center rounded-icon border border-[color:var(--gold-border)] bg-white/60 text-espresso backdrop-blur-glass transition-transform duration-120 active:scale-95"
          >
            <Bell className="h-5 w-5" />
            {atRiskCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-risk-high" />
            )}
          </Link>
        }
      />

      <div className="animate-fade-up space-y-4 px-4 py-4">
        <FilterChips
          options={FILTERS}
          value={status}
          onChange={setStatus}
        />

        {/* Section header + count */}
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl leading-tight tracking-tight text-espresso">
            Călătoriile tale
          </h2>
          {!isLoading && !isError && count > 0 && (
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent-deep/70">
              {count} {count === 1 ? "zbor" : "zboruri"}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {isLoading && (
            <>
              <FlightCardSkeleton />
              <FlightCardSkeleton />
            </>
          )}

          {isError && (
            <div className="rounded-card border border-[color:var(--gold-border)] bg-white/[0.52] p-6 text-center text-sm font-medium text-warm-muted shadow-glass backdrop-blur-glass">
              Nu am putut încărca zborurile.
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-1 font-bold text-accent-deep"
              >
                Reîncearcă
              </button>
            </div>
          )}

          {pnrs && pnrs.length === 0 && (
            <EmptyState
              icon={<PlaneTakeoff className="h-7 w-7" />}
              title="Niciun zbor adăugat"
              description="Adaugă un zbor și te anunțăm din timp dacă apare risc de ceață la Iași."
              action={
                <Link href="/flights/add">
                  <CButton variant="gold" rightIcon={<Plus className="h-4 w-4" />}>
                    Adaugă zbor
                  </CButton>
                </Link>
              }
            />
          )}

          {pnrs && pnrs.length > 0 && (
            <>
              {pnrs.map((pnr) => (
                <FlightCard key={pnr.id} pnr={pnr} />
              ))}
              <Link
                href="/flights/add"
                className="flex items-center justify-center gap-1.5 rounded-card border border-dashed border-[color:var(--gold-border-strong)] py-3.5 text-sm font-bold tracking-tight text-accent-deep transition-colors duration-150 hover:bg-accent/[0.08]"
              >
                <Plus className="h-4 w-4" />
                Adaugă zbor
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
