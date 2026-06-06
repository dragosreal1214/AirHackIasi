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

type Mode = "number" | "route";

export default function AddFlightPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("number");
  const [flightNo, setFlightNo] = useState("");
  const [origin, setOrigin] = useState("IAS");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const addPnr = useAddPnr();
  const [error, setError] = useState<string | null>(null);

  const dFlightNo = useDebounce(flightNo, 300);
  const dOrigin = useDebounce(origin, 300);
  const dDestination = useDebounce(destination, 300);
  const dDate = useDebounce(date, 300);
  const params =
    mode === "number"
      ? { q: dFlightNo, date: dDate || undefined }
      : { origin: dOrigin, destination: dDestination, date: dDate || undefined };
  const { data: results, isFetching } = useFlightSearch(params);

  async function handleAdd(flight: FlightSummary) {
    setError(null);
    try {
      await addPnr.mutateAsync({ flightId: flight.id });
      router.push("/");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Nu am putut adăuga zborul.");
    }
  }

  const hasQuery =
    mode === "number" ? flightNo.trim().length >= 2 : destination.trim().length >= 2;
  const showEmpty = hasQuery && !isFetching && results?.length === 0;
  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <>
      <AppBar title="Adaugă zbor" backHref="/" />

      <div className="px-4 py-4">
        {/* Mode toggle */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {(["number", "route"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {m === "number" ? "După număr" : "După rută"}
            </button>
          ))}
        </div>

        {mode === "number" ? (
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={flightNo}
              onChange={(e) => setFlightNo(e.target.value)}
              placeholder="Număr zbor (ex. W4 3651, RO 702)"
              className={`${field} pl-11`}
            />
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block px-1 text-xs font-medium text-slate-500">De la</span>
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="IAS" className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block px-1 text-xs font-medium text-slate-500">Către</span>
              <input
                autoFocus
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="OTP / Londra"
                className={field}
              />
            </label>
          </div>
        )}

        <label className="mt-2 block">
          <span className="mb-1 block px-1 text-xs font-medium text-slate-500">Data</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </label>

        <p className="mt-2 px-1 text-xs text-slate-400">
          {mode === "number"
            ? "Caută după numărul zborului. Demo: încearcă „W4” sau „RO”."
            : "Caută după rută (cod IATA sau oraș). Demo: IAS → OTP."}
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
              Nu am găsit niciun zbor.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
