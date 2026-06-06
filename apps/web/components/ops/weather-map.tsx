"use client";

import { MapPin, Satellite } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Stylized "weather map" panel with a graceful no-token fallback.
 *
 * Renders a sky→sand gradient card with a labelled marker at LRIA (Iași) and a
 * translucent pulsing fog overlay whose opacity and size scale with the current
 * peak fog-risk probability. When NEXT_PUBLIC_MAPBOX_TOKEN is present we show a
 * small "Mapbox live" badge (real tiles can be wired in later); otherwise it is
 * purely the stylized panel.
 */
export function WeatherMap({
  probability,
  className,
}: {
  /** Peak fog-risk probability in 0..1. */
  probability?: number;
  className?: string;
}) {
  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
  const p = Math.max(0, Math.min(1, probability ?? 0));
  const pct = Math.round(p * 100);

  // Fog overlay scales with risk: faint + small at low risk, dense + large at high.
  const fogOpacity = 0.12 + p * 0.6; // 0.12 → 0.72
  const fogScale = 0.45 + p * 0.85; // ~0.45 → ~1.3 of the marker zone

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Hartă meteo · LRIA</h2>
        {hasToken ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky/40 bg-sky/10 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
            <Satellite className="h-3 w-3" /> Mapbox live
          </span>
        ) : (
          <span className="text-xs text-slate-400">Vizualizare stilizată</span>
        )}
      </div>

      {/* Stylized map surface: sky → sand gradient */}
      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-200 via-sky-50 to-amber-100">
        {/* Soft latitude lines */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          {[20, 40, 60, 80].map((top) => (
            <div
              key={top}
              className="absolute left-0 right-0 border-t border-white/50"
              style={{ top: `${top}%` }}
            />
          ))}
        </div>

        {/* Pulsing fog overlay — opacity & size scale with peak risk */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="animate-pulse rounded-full bg-slate-200 blur-2xl"
            style={{
              width: `${Math.round(180 * fogScale)}px`,
              height: `${Math.round(180 * fogScale)}px`,
              opacity: fogOpacity,
            }}
          />
        </div>

        {/* LRIA marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="relative mx-auto h-3 w-3">
            <span
              className="absolute inset-0 animate-ping rounded-full bg-primary/60"
              style={{ opacity: 0.3 + p * 0.5 }}
            />
            <span className="absolute inset-0 rounded-full bg-primary ring-2 ring-white" />
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-primary" /> Iași (LRIA)
          </div>
          <div className="mt-1.5 text-xs font-medium text-slate-500">
            Risc ceață: <span className="font-bold tabular-nums text-slate-700">{pct}%</span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-400">
        Densitatea ceții reflectă riscul maxim prognozat
      </p>
    </div>
  );
}
