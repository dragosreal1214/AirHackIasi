"use client";

import { useQuery } from "@tanstack/react-query";
import { Radio, RotateCcw } from "lucide-react";
import { useState } from "react";

import { FogChart } from "@/components/ops/fog-chart";
import { WeatherMap } from "@/components/ops/weather-map";
import { RiskBadge } from "@/components/shared/risk-badge";
import { getAirports, getForecast, getTimeline } from "@/lib/api";
import { cn } from "@/lib/utils";

const REPLAY_EVENTS = [
  { date: "2024-12-20", label: "20 dec 2024" },
  { date: "2025-01-01", label: "1 ian 2025" },
  { date: "2025-11-10", label: "10 nov 2025" },
];

function fmt(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)} ${iso.slice(11, 16)}`;
}

export default function OpsDashboard() {
  const [mode, setMode] = useState<
    { kind: "live"; airport: string } | { kind: "replay"; date: string }
  >({ kind: "live", airport: "IAS" });

  const airports = useQuery({ queryKey: ["airports"], queryFn: getAirports });

  const query = useQuery({
    queryKey:
      mode.kind === "live" ? ["forecast", mode.airport] : ["timeline", mode.date],
    queryFn: () =>
      mode.kind === "live" ? getForecast(mode.airport) : getTimeline(mode.date),
  });

  const data = query.data;
  const highHours = data?.hourly.filter((h) => h.probability >= 0.65).length ?? 0;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <img
              src="/cine/fogora-mark.png"
              alt="Fogora"
              className="h-[22px] w-[22px] rounded-icon object-contain"
            />
            Fogora Ops · Aeroport Iași (LRIA)
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Monitor risc de ceață
          </h1>
        </div>
        {data?.peak && <RiskBadge level={data.peak.level} className="text-sm" />}
      </header>

      {/* Source toggle */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode({ kind: "live", airport: mode.kind === "live" ? mode.airport : "IAS" })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold",
            mode.kind === "live" ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200",
          )}
        >
          <Radio className="h-4 w-4" /> Live (Open-Meteo)
        </button>
        {mode.kind === "live" && (
          <select
            value={mode.airport}
            onChange={(e) => setMode({ kind: "live", airport: e.target.value })}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
          >
            {(airports.data ?? []).map((a) => (
              <option key={a.iata} value={a.iata}>
                {a.iata} · {a.city}
              </option>
            ))}
          </select>
        )}
        <span className="mx-1 text-xs text-slate-400">|</span>
        <RotateCcw className="h-4 w-4 text-slate-400" />
        {REPLAY_EVENTS.map((e) => (
          <button
            key={e.date}
            type="button"
            onClick={() => setMode({ kind: "replay", date: e.date })}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold",
              mode.kind === "replay" && mode.date === e.date
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Risc maxim" value={data?.peak ? `${Math.round(data.peak.probability * 100)}%` : "—"} />
        <Stat label="Ore cu risc ridicat" value={String(highHours)} />
        <Stat label="Ferestre de ceață" value={String(data?.windows.length ?? 0)} />
      </div>

      {/* Chart + weather map */}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Probabilitate de ceață pe ore
            </h2>
            <span className="text-xs text-slate-400">
              {mode.kind === "live"
                ? `Prognoză live · ${mode.airport}`
                : `Replay · IAS · ${mode.date}`}
            </span>
          </div>
          {query.isLoading && <div className="h-72 animate-pulse rounded-xl bg-slate-100" />}
          {data && data.available && data.hourly.length > 0 && <FogChart hourly={data.hourly} />}
          {data && (!data.available || data.hourly.length === 0) && (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              {mode.kind === "live"
                ? "Prognoza live nu e disponibilă momentan."
                : "Nu există date pentru această zi."}
            </div>
          )}
        </div>
        <WeatherMap probability={data?.peak?.probability} />
      </div>

      {/* Windows + explanation */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">Ferestre de risc ridicat</h3>
          {data && data.windows.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {data.windows.map((w, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-risk-high" />
                  {fmt(w.start)} — {fmt(w.end)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Nicio fereastră de risc ridicat.</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">Analiză model</h3>
          {data?.peak ? (
            <p className="mt-2 text-sm text-slate-600">
              🤖 Vârf la <b>{fmt(data.peak.time)}</b>: {data.peak.explanation}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Fără risc semnificativ.</p>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Model XGBoost pe 2 ani METAR LRIA · prag risc ridicat 65%
      </p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}
