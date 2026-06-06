"use client";

import type { Alternative } from "@aerly/shared";
import { AlertTriangle, ArrowUpRight, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AlternativeCard } from "@/components/passenger/alternative-card";
import { AppBar } from "@/components/passenger/app-bar";
import { RiskMeter } from "@/components/passenger/risk-meter";
import { RouteDisplay } from "@/components/passenger/route-display";
import { WeatherRiskPanel } from "@/components/passenger/weather-risk";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/divider";
import { CRing } from "@/components/ui/success-ring";
import {
  useAlternatives,
  useDisruption,
  useSelectAlternative,
} from "@/hooks/use-disruption";
import { formatDateTime, riskPercent } from "@/lib/format";

export default function DisruptionPage() {
  const { id } = useParams<{ id: string }>();
  const disruption = useDisruption(id);
  const alternatives = useAlternatives(id);
  const select = useSelectAlternative();

  const [confirming, setConfirming] = useState<Alternative | null>(null);
  const [selected, setSelected] = useState<Alternative | null>(null);

  async function confirm() {
    if (!confirming) return;
    const alt = confirming;
    await select.mutateAsync(alt.id);
    setConfirming(null);
    setSelected(alt);
    window.open(alt.actionUrl, "_blank", "noopener,noreferrer");
  }

  const flight = disruption.data?.flight;
  const cancelPct = disruption.data
    ? riskPercent(disruption.data.risk.probability)
    : 0;

  return (
    <>
      <AppBar title="Alertă zbor" subtitle="Risc & alternative" backHref="/" />

      <div className="space-y-5 px-4 py-5">
        {/* Hero */}
        {disruption.isLoading && (
          <div className="skeleton-shimmer h-64 animate-shimmer rounded-card" />
        )}
        {flight && disruption.data && (
          <GoldCard elevated className="animate-c-fade-up p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-high/[0.13] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-risk-high">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.2} />
                Risc ridicat de ceață
              </span>
              <span className="text-[11px] font-medium text-warm-muted">
                {flight.flightNumber}
              </span>
            </div>

            <div className="mt-4">
              <RouteDisplay flight={flight} big />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-medium text-warm-muted">
                {flight.airlineName}
              </span>
              <span className="font-medium text-warm-ink">
                {formatDateTime(flight.scheduledDeparture)}
              </span>
            </div>

            <GoldDivider className="my-4" />

            <RiskMeter risk={disruption.data.risk} />

            {/* Cancellation risk bar */}
            <div className="mt-4 rounded-input border border-[color:var(--gold-border)] bg-white/50 px-3.5 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-warm-muted">
                  Risc de anulare
                </span>
                <span className="text-sm font-bold tabular-nums text-risk-critical">
                  {cancelPct}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-warm-faint/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-risk-high to-risk-critical transition-all duration-180 ease-cinematic"
                  style={{ width: `${cancelPct}%` }}
                />
              </div>
            </div>
          </GoldCard>
        )}

        {/* Weather / risk panel */}
        {disruption.data && (
          <div className="animate-c-fade-up" style={{ animationDelay: "70ms" }}>
            <WeatherRiskPanel
              risk={disruption.data.risk}
              destinationRisk={disruption.data.destinationRisk}
              destinationIata={flight?.destinationIata}
            />
          </div>
        )}

        {/* Alternatives */}
        <div className="animate-c-fade-up" style={{ animationDelay: "140ms" }}>
          <div className="mb-3 flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4 text-accent-deep" strokeWidth={2} />
            <h2 className="font-display text-xl leading-tight tracking-tight text-espresso">
              {alternatives.data
                ? `${alternatives.data.length} alternative`
                : "Caut alternative…"}
            </h2>
            {alternatives.data && (
              <span className="text-xs font-medium text-warm-muted">
                sortate pentru tine
              </span>
            )}
          </div>

          <div className="space-y-3">
            {alternatives.isLoading &&
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton-shimmer h-40 animate-shimmer rounded-card"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}

            {alternatives.data?.map((alt, i) => (
              <div
                key={alt.id}
                className="animate-c-fade-up"
                style={{ animationDelay: `${180 + i * 70}ms` }}
              >
                <AlternativeCard
                  alternative={alt}
                  onSelect={setConfirming}
                  pending={select.isPending}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <GoldCard
          className="flex animate-c-fade-up items-center justify-between p-4"
          style={{ animationDelay: "240ms" }}
        >
          <div className="text-sm text-warm-ink">Întrebări? Sună la suport.</div>
          <a
            href="tel:+40212014000"
            className="inline-flex items-center gap-1.5 rounded-button border border-[color:var(--gold-border-strong)] bg-white/60 px-3 py-2 text-sm font-semibold text-accent-deep backdrop-blur-lg transition-transform duration-120 ease-cinematic active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            Sună la suport
          </a>
        </GoldCard>

        {/* Ghost links */}
        <div
          className="flex animate-c-fade-up flex-col gap-1 pt-1"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/compensation"
            className="inline-flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-accent-deep transition-opacity duration-120 active:opacity-60"
          >
            Vezi compensația
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            href="/hotels"
            className="inline-flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-accent-deep transition-opacity duration-120 active:opacity-60"
          >
            Cazare peste noapte
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center p-4"
          style={{ background: "rgba(29,22,16,0.55)" }}
        >
          <div className="w-full max-w-md animate-fade-up rounded-card border border-[color:var(--gold-border-strong)] bg-ivory/95 p-5 shadow-glass backdrop-blur-glass">
            <h3 className="font-display text-2xl leading-tight tracking-tight text-espresso">
              Continui spre rezervare?
            </h3>
            <p className="mt-2 text-sm text-warm-muted">
              Te trimitem către pagina de rezervare pentru „{confirming.title}”.
            </p>
            <div className="mt-5 flex gap-2.5">
              <CButton
                variant="ivory"
                full
                onClick={() => setConfirming(null)}
                className="flex-1"
              >
                Anulează
              </CButton>
              <CButton
                variant="gold"
                full
                onClick={confirm}
                disabled={select.isPending}
                className="flex-1"
              >
                Continuă
              </CButton>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {selected && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          style={{ background: "rgba(29,22,16,0.55)" }}
        >
          <div className="w-full max-w-md animate-scale-in rounded-card border border-[color:var(--gold-border-strong)] bg-ivory/95 p-6 text-center shadow-glass backdrop-blur-glass">
            <CRing size={104} className="mx-auto" />
            <h3 className="mt-4 font-display text-2xl leading-tight tracking-tight text-espresso">
              Am marcat această alternativă ca aleasă.
            </h3>
            <p className="mt-2 text-sm text-warm-muted">{selected.title}</p>
            <CButton
              variant="gold"
              full
              onClick={() => setSelected(null)}
              className="mt-6"
            >
              Gata
            </CButton>
          </div>
        </div>
      )}
    </>
  );
}
