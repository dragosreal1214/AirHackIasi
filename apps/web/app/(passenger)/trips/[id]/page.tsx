"use client";

import type { RiskLevel } from "@aerly/shared";
import {
  CloudFog,
  CloudRain,
  Clock,
  Calendar,
  Plane,
  ArrowRight,
  CircleAlert,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { RouteDisplay } from "@/components/passenger/route-display";
import { RiskGauge } from "@/components/passenger/risk-gauge";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { useFlightDetail } from "@/hooks/use-flight-detail";
import {
  RISK_META,
  formatDate,
  formatDuration,
  formatTime,
  riskPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const LEVEL_WORD: Record<RiskLevel, string> = {
  low: "Scăzut",
  moderate: "Moderat",
  high: "Ridicat",
  critical: "Critic",
};

const WEATHER_ICON: Record<string, ReactNode> = {
  fog: <CloudFog className="h-3.5 w-3.5" strokeWidth={2} />,
  bad_weather: <CloudRain className="h-3.5 w-3.5" strokeWidth={2} />,
  overall: <CircleAlert className="h-3.5 w-3.5" strokeWidth={2} />,
};

export default function FlightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useFlightDetail(id);

  return (
    <>
      <AppBar title="Detalii zbor" backHref="/trips" />

      <div className="space-y-5 px-4 py-5 pb-safe-bottom">
        {isLoading && (
          <>
            <div className="skeleton-shimmer h-60 animate-shimmer rounded-card" />
            <div className="skeleton-shimmer h-40 animate-shimmer rounded-card" />
            <div className="skeleton-shimmer h-52 animate-shimmer rounded-card" />
            <div className="skeleton-shimmer h-36 animate-shimmer rounded-card" />
          </>
        )}

        {data && (
          <FlightDetailBody data={data} />
        )}
      </div>
    </>
  );
}

function FlightDetailBody({
  data,
}: {
  data: NonNullable<ReturnType<typeof useFlightDetail>["data"]>;
}) {
  const { flight, info, weather, timeline, cancelProbability, disruptionId } =
    data;
  const atRisk = Boolean(disruptionId);

  const cancelLevel = data.risk.level;
  const cancelMeta = RISK_META[cancelLevel];
  const cancelPct = riskPercent(cancelProbability);
  const showFogWindow = cancelLevel === "high" || cancelLevel === "critical";

  return (
    <>
      {/* Hero */}
      <GoldCard
        active={atRisk}
        elevated
        className="animate-c-fade-up overflow-hidden p-5"
      >
        <div className="flex items-center justify-between">
          {atRisk ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-high/[0.13] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-risk-high">
              <CircleAlert className="h-3.5 w-3.5" strokeWidth={2.2} />
              Risc de perturbare
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-low/[0.13] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-risk-low">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-risk-low" />
              La timp
            </span>
          )}
        </div>

        <div className="mt-4">
          <RouteDisplay flight={flight} big />
        </div>

        {/* Times */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="font-display text-3xl leading-none tracking-tight text-espresso">
            {formatTime(flight.scheduledDeparture)}
          </span>
          <ArrowRight className="h-4 w-4 text-warm-faint" strokeWidth={2} />
          <span className="font-display text-3xl leading-none tracking-tight text-espresso">
            {formatTime(flight.scheduledArrival)}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 border-t border-[color:var(--gold-border)] pt-3 text-xs font-medium text-warm-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(flight.scheduledDeparture)}
          </span>
          <span className="text-warm-faint">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5" />
            {flight.airlineName}
          </span>
          <span className="text-warm-faint">·</span>
          <span className="font-semibold text-warm-ink">
            {flight.flightNumber}
          </span>
        </div>

        {/* Duration pill */}
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold-border)] bg-white/50 px-3 py-1 text-xs font-semibold text-warm-ink">
            <Clock className="h-3.5 w-3.5 text-accent-deep" />
            {formatDuration(info.durationMinutes)}
          </span>
        </div>
      </GoldCard>

      {/* Cancellation risk */}
      <GoldCard
        className="animate-c-fade-up p-5"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-warm-muted">
            Risc de anulare a zborului
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-tight",
              cancelMeta.bg,
              cancelMeta.text,
              cancelMeta.border,
            )}
          >
            {LEVEL_WORD[cancelLevel]}
          </span>
        </div>

        <div
          className={cn(
            "mt-2 font-display text-5xl leading-none tracking-tight",
            cancelMeta.text,
          )}
        >
          {cancelPct}%
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-warm-faint/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-soft via-accent to-accent-deep transition-all duration-180 ease-cinematic"
            style={{ width: `${cancelPct}%` }}
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-warm-muted">
          Bazat pe condițiile de ceață și date istorice METAR pentru{" "}
          {flight.originIata}.
          {showFogWindow && (
            <>
              {" "}
              Riscul crește semnificativ între 04:00–09:00.
            </>
          )}
        </p>
      </GoldCard>

      {/* Weather panel */}
      <div
        className="animate-c-fade-up overflow-hidden rounded-card border border-white/[0.08] p-5 text-ivory shadow-glass"
        style={{
          animationDelay: "120ms",
          background:
            "radial-gradient(120% 100% at 0% 0%, #2E5C82 0%, #1f3f5c 45%, #15293b 100%)",
        }}
      >
        <h3 className="font-display text-lg leading-tight tracking-tight text-ivory">
          🌥️ Risc meteo zbor
        </h3>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {weather.map((g) => (
            <RiskGauge
              key={g.key}
              value={g.value}
              level={g.level}
              label={g.label}
              icon={WEATHER_ICON[g.key]}
            />
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] font-medium text-sky/70">
          Bazat pe date METAR pentru {flight.originIata}.
        </p>
      </div>

      {/* Flight info */}
      <div
        className="animate-c-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <h2 className="mb-2.5 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-deep/70">
          Informații zbor
        </h2>
        <GoldCard className="p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <InfoCell label="Terminal" value={info.terminal} />
            <InfoCell label="Poartă" value={info.gate} />
            <InfoCell label="Bandă bagaje" value={info.baggageBelt} />
            <InfoCell
              label="Durată"
              value={formatDuration(info.durationMinutes)}
            />
          </div>
        </GoldCard>
      </div>

      {/* Itinerary timeline */}
      {timeline.length > 0 && (
        <div
          className="animate-c-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <h2 className="mb-2.5 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-deep/70">
            Itinerariu
          </h2>
          <GoldCard className="p-5">
            <ol className="relative">
              {timeline.map((step, i) => {
                const last = i === timeline.length - 1;
                return (
                  <li key={step.label} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {!last && (
                      <span
                        className={cn(
                          "absolute left-[11px] top-6 h-full w-px",
                          step.done ? "bg-accent/50" : "bg-warm-faint/30",
                        )}
                      />
                    )}
                    <span className="relative z-10 mt-0.5 flex-shrink-0">
                      {step.done ? (
                        <CheckCircle2
                          className="h-[22px] w-[22px] text-accent-deep"
                          strokeWidth={2}
                        />
                      ) : (
                        <Circle
                          className="h-[22px] w-[22px] text-warm-faint"
                          strokeWidth={2}
                        />
                      )}
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          step.done ? "text-espresso" : "text-warm-muted",
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-warm-ink">
                        {formatTime(step.time)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </GoldCard>
        </div>
      )}

      {/* Alternatives CTA */}
      {atRisk && disruptionId && (
        <Link
          href={`/d/${disruptionId}`}
          className="block animate-c-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <CButton
            variant="gold"
            full
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Vezi {data.alternativesCount} alternative
          </CButton>
        </Link>
      )}
    </>
  );
}

function InfoCell({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-warm-muted">
        {label}
      </div>
      <div className="mt-0.5 text-base font-bold tracking-tight text-espresso">
        {value ?? "—"}
      </div>
    </div>
  );
}
