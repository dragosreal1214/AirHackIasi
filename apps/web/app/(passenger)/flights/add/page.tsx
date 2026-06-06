"use client";

import type { FlightSummary } from "@aerly/shared";
import { ArrowRight, MapPin, Plane, Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { GoldCard } from "@/components/ui/card";
import { CLabel } from "@/components/ui/label";
import { TextField } from "@/components/ui/text-field";
import { ApiClientError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
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

  return (
    <>
      <AppBar title="Adaugă zbor" backHref="/" />

      <div className="animate-fade-up px-4 py-5">
        {/* Mode toggle — cinematic segmented control */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-button border border-[color:var(--gold-border)] bg-white/60 p-1 shadow-glass backdrop-blur-glass">
          {(["number", "route"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-button py-2.5 text-sm font-semibold transition-all duration-180 ease-cinematic",
                mode === m
                  ? "bg-accent text-espresso shadow-gold-button"
                  : "text-warm-muted hover:text-espresso",
              )}
            >
              {m === "number" ? "După număr" : "După rută"}
            </button>
          ))}
        </div>

        {mode === "number" ? (
          <TextField
            autoFocus
            leftIcon={<Search className="h-5 w-5" />}
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value)}
            placeholder="Număr zbor (ex. W4 3651, RO 702)"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <CLabel className="px-1">De la</CLabel>
              <TextField
                leftIcon={<MapPin className="h-5 w-5" />}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="IAS"
              />
            </div>
            <div className="space-y-1.5">
              <CLabel className="px-1">Către</CLabel>
              <TextField
                autoFocus
                leftIcon={<MapPin className="h-5 w-5" />}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="OTP / Londra"
              />
            </div>
          </div>
        )}

        <div className="mt-2 space-y-1.5">
          <CLabel className="px-1">Data</CLabel>
          <TextField
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <p className="mt-3 px-1 text-xs font-medium text-warm-muted">
          {mode === "number"
            ? "Caută după numărul zborului. Demo: încearcă „W4” sau „RO”."
            : "Caută după rută (cod IATA sau oraș). Demo: IAS → OTP."}
        </p>

        {error && (
          <GoldCard
            elevated
            className="mt-3 border-risk-high/40 px-4 py-3 text-sm font-semibold text-risk-high"
          >
            {error}
          </GoldCard>
        )}

        <div className="mt-5 space-y-2.5">
          {results?.map((flight) => (
            <GoldCard
              key={flight.id}
              interactive
              elevated
              role="button"
              tabIndex={0}
              aria-disabled={addPnr.isPending}
              onClick={() => {
                if (!addPnr.isPending) handleAdd(flight);
              }}
              className={cn(
                "flex items-center gap-3 p-4",
                addPnr.isPending && "pointer-events-none opacity-60",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-icon border border-[color:var(--gold-border)] bg-accent/[0.12] text-accent-deep">
                <Plane className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-espresso">
                  {flight.flightNumber} · {flight.originIata} → {flight.destinationIata}
                </div>
                <div className="truncate text-xs font-medium text-warm-muted">
                  {flight.airlineName} · {formatDateTime(flight.scheduledDeparture)}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-accent-deep" />
            </GoldCard>
          ))}

          {showEmpty && (
            <div className="flex animate-fade-up flex-col items-center py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-card border border-[var(--gold-border-strong)] bg-accent/[0.12] text-accent-deep shadow-glass">
                <SearchX className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-display text-2xl leading-tight tracking-tight text-espresso">
                Niciun rezultat
              </h2>
              <p className="mt-2 max-w-xs text-sm font-medium leading-relaxed text-warm-muted">
                Nu am găsit niciun zbor pentru căutarea ta.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
