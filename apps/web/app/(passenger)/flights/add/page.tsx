"use client";

import type { FlightSummary } from "@aerly/shared";
import { ArrowRight, Plane, Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { ApiClientError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useDebounce } from "@/hooks/use-debounce";
import { useFlightSearch } from "@/hooks/use-flights";
import { useAddPnr } from "@/hooks/use-pnrs";

export default function AddFlightPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const { data: results, isFetching } = useFlightSearch(debounced);
  const addPnr = useAddPnr();
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(flight: FlightSummary) {
    setError(null);
    try {
      await addPnr.mutateAsync({ flightId: flight.id });
      router.push("/");
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : "Nu am putut adăuga zborul.",
      );
    }
  }

  const showEmpty = debounced.length >= 2 && !isFetching && results?.length === 0;

  return (
    <>
      <AppBar title="Adaugă zbor" backHref="/" />

      <div className="px-4 py-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Număr zbor (ex. RO 632)"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <p className="mt-2 px-1 text-xs text-slate-400">
          Caută după numărul zborului. Demo: încearcă „RO” sau „W6”.
        </p>

        {error && (
          <div className="mt-3 rounded-xl bg-risk-high/10 px-4 py-3 text-sm font-medium text-risk-high">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-2.5">
          {results?.map((flight) => (
            <button
              key={flight.id}
              type="button"
              onClick={() => handleAdd(flight)}
              disabled={addPnr.isPending}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition active:scale-[0.99] disabled:opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Plane className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900">
                  {flight.flightNumber} · {flight.originIata} → {flight.destinationIata}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {flight.airlineName} · {formatDateTime(flight.scheduledDeparture)}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
            </button>
          ))}

          {showEmpty && (
            <div className="flex flex-col items-center py-12 text-center text-sm text-slate-500">
              <SearchX className="mb-2 h-7 w-7 text-slate-300" />
              Nu am găsit acest zbor.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
