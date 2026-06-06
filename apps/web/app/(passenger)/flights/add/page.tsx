"use client";

import type { FlightSummary } from "@aerly/shared";
import { ArrowRight, MapPin, Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AirlineBadge } from "@/components/passenger/airline-badge";
import { AppBar } from "@/components/passenger/app-bar";
import { GoldCard } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FilterChips } from "@/components/ui/filter-chips";
import { CLabel } from "@/components/ui/label";
import { TextField } from "@/components/ui/text-field";
import { TimePicker } from "@/components/ui/time-picker";
import { ApiClientError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useFlightSearch } from "@/hooks/use-flights";
import { useAddPnr } from "@/hooks/use-pnrs";

type Mode = "route" | "number";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "route", label: "După rută" },
  { value: "number", label: "După număr zbor" },
];

export default function AddFlightPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("route");
  const [flightNo, setFlightNo] = useState("");
  const [origin, setOrigin] = useState("IAS");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const addPnr = useAddPnr();
  const [error, setError] = useState<string | null>(null);

  const dFlightNo = useDebounce(flightNo, 300);
  const dOrigin = useDebounce(origin, 300);
  const dDestination = useDebounce(destination, 300);
  const dDate = useDebounce(date, 300);
  const dTime = useDebounce(time, 300);

  const params =
    mode === "number"
      ? { q: dFlightNo, date: dDate || undefined }
      : {
          origin: dOrigin,
          destination: dDestination,
          date: dDate || undefined,
          time: dTime || undefined,
        };
  const { data: results, isFetching } = useFlightSearch(params);

  async function handleAdd(flight: FlightSummary) {
    setError(null);
    try {
      await addPnr.mutateAsync({ flightId: flight.id });
      router.push("/trips");
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

      <div className="animate-c-fade-up px-4 py-5">
        {/* Mode toggle — caută după rută sau după numărul zborului */}
        <FilterChips
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
          className="mb-5"
        />

        {mode === "route" ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <CLabel className="px-1">Origine</CLabel>
                <TextField
                  leftIcon={<MapPin className="h-5 w-5" />}
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="IAS"
                />
              </div>
              <div className="space-y-1.5">
                <CLabel className="px-1">Destinație</CLabel>
                <TextField
                  autoFocus
                  leftIcon={<MapPin className="h-5 w-5" />}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="OTP / Londra"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <CLabel className="px-1">Dată</CLabel>
                <DatePicker value={date} onChange={setDate} />
              </div>
              <div className="space-y-1.5">
                <CLabel className="px-1">Oră</CLabel>
                <TimePicker value={time} onChange={setTime} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <CLabel className="px-1">Număr zbor</CLabel>
              <TextField
                autoFocus
                leftIcon={<Search className="h-5 w-5" />}
                value={flightNo}
                onChange={(e) => setFlightNo(e.target.value)}
                placeholder="Număr zbor (ex. W4 3651, RO 702)"
              />
            </div>
            <div className="space-y-1.5">
              <CLabel className="px-1">Dată (opțional)</CLabel>
              <DatePicker value={date} onChange={setDate} placeholder="Orice dată" />
            </div>
          </div>
        )}

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
              <AirlineBadge code={flight.airlineCode} size={40} />
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
