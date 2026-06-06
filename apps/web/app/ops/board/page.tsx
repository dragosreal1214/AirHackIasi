"use client";

import { useQuery } from "@tanstack/react-query";
import { Plane } from "lucide-react";
import { useState } from "react";

import { RiskBadge } from "@/components/shared/risk-badge";
import { useAirportRiskBoard } from "@/hooks/use-airport-board";
import { getAirports } from "@/lib/api";
import { formatDate, formatTime, riskPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type Direction = "departures" | "arrivals" | "all";

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "departures", label: "Plecări" },
  { value: "arrivals", label: "Sosiri" },
  { value: "all", label: "Toate" },
];

const RISK_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FlightRiskBoard() {
  const [iata, setIata] = useState("IAS");
  const [date, setDate] = useState(todayIso());
  const [direction, setDirection] = useState<Direction>("departures");

  const airports = useQuery({ queryKey: ["airports"], queryFn: getAirports });
  const board = useAirportRiskBoard(iata, date, direction);

  const data = board.data;
  const flights = [...(data?.flights ?? [])].sort(
    (a, b) =>
      (RISK_ORDER[a.riskLevel] ?? 9) - (RISK_ORDER[b.riskLevel] ?? 9) ||
      b.riskProbability - a.riskProbability,
  );

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <img
              src="/cine/fogora-mark-256.png"
              alt="Fogora"
              className="h-[22px] w-[22px] rounded-icon object-contain"
            />
            Fogora Ops · Risc zboruri
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Board risc zboruri
          </h1>
        </div>
        {data?.airportFogRisk && (
          <RiskBadge level={data.airportFogRisk.level} className="text-sm" />
        )}
      </header>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={iata}
          onChange={(e) => setIata(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700"
        >
          {(airports.data ?? [{ iata: "IAS", name: "Iași", city: "Iași", country: "RO" }]).map(
            (a) => (
              <option key={a.iata} value={a.iata}>
                {a.iata} · {a.city}
              </option>
            ),
          )}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700"
        />

        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
          {DIRECTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDirection(d.value)}
              className={cn(
                "rounded-full px-3.5 py-1 text-sm font-semibold transition-colors",
                direction === d.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total zboruri" value={data ? String(data.summary.total) : "—"} />
        <Stat
          label="Nr. la risc"
          value={data ? String(data.summary.atRisk) : "—"}
          accent
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-400">Risc ceață aeroport</div>
          <div className="mt-1.5 flex items-center gap-2">
            {data?.airportFogRisk ? (
              <>
                <RiskBadge level={data.airportFogRisk.level} />
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  {riskPercent(data.airportFogRisk.probability)}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-slate-900">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Zbor</th>
              <th className="px-4 py-3">Rută</th>
              <th className="px-4 py-3">Plecare</th>
              <th className="px-4 py-3 text-right">Risc</th>
            </tr>
          </thead>
          <tbody>
            {board.isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-4 w-full max-w-[120px] animate-shimmer rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))}

            {!board.isLoading &&
              flights.map((f) => (
                <tr
                  key={f.flightId}
                  className={cn(
                    "border-b border-slate-100 last:border-0",
                    f.atRisk && "bg-risk-high/[0.06]",
                  )}
                >
                  <td className="px-4 py-3.5 font-semibold tabular-nums text-slate-900">
                    {f.airlineCode}
                    {f.flightNumber}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                      {f.originIata}
                      <Plane className="h-3.5 w-3.5 -rotate-45 text-slate-400" />
                      {f.destinationIata}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="font-medium tabular-nums text-slate-900">
                      {formatTime(f.scheduledDeparture)}
                    </span>
                    <span className="ml-1.5 text-xs text-slate-400">
                      {formatDate(f.scheduledDeparture)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <RiskBadge level={f.riskLevel} />
                      <span className="w-9 text-right font-semibold tabular-nums text-slate-700">
                        {riskPercent(f.riskProbability)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {!board.isLoading && flights.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-1 py-14 text-center">
            <Plane className="h-7 w-7 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              Niciun zbor pentru acest filtru.
            </p>
            <p className="text-xs text-slate-400">
              Schimbă aeroportul, data sau direcția.
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Risc estimat din modelul de ceață XGBoost · LRIA
      </p>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          accent ? "text-risk-high" : "text-slate-900",
        )}
      >
        {value}
      </div>
    </div>
  );
}
