"use client";

import { Bell, PlaneTakeoff, Plus } from "lucide-react";
import Link from "next/link";

import { AppBar } from "@/components/passenger/app-bar";
import { EmptyState } from "@/components/passenger/empty-state";
import {
  FlightCard,
  FlightCardSkeleton,
} from "@/components/passenger/flight-card";
import { usePnrs } from "@/hooks/use-pnrs";

export default function HomePage() {
  const { data: pnrs, isLoading, isError, refetch } = usePnrs("active");
  const atRiskCount = pnrs?.filter((p) => p.disruptionId).length ?? 0;

  return (
    <>
      <AppBar
        title="Zborurile tale"
        action={
          <Link
            href="/notifications"
            aria-label="Notificări"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
            {atRiskCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-risk-high" />
            )}
          </Link>
        }
      />

      <div className="space-y-3 px-4 py-4">
        {isLoading && (
          <>
            <FlightCardSkeleton />
            <FlightCardSkeleton />
          </>
        )}

        {isError && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Nu am putut încărca zborurile.
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-1 font-semibold text-primary"
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
              <Link
                href="/flights/add"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Adaugă zbor
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
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 py-3.5 text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              Adaugă zbor
            </Link>
          </>
        )}
      </div>
    </>
  );
}
