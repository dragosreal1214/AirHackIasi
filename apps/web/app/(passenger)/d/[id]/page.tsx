"use client";

import type { Alternative } from "@aerly/shared";
import { AlertTriangle, ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AlternativeCard } from "@/components/passenger/alternative-card";
import { AppBar } from "@/components/passenger/app-bar";
import { RiskMeter } from "@/components/passenger/risk-meter";
import {
  useAlternatives,
  useDisruption,
  useSelectAlternative,
} from "@/hooks/use-disruption";
import { formatDateTime } from "@/lib/format";

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

  return (
    <>
      <AppBar title="Alertă zbor" backHref="/" />

      <div className="px-4 py-4">
        {/* Hero */}
        {disruption.isLoading && (
          <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
        )}
        {flight && disruption.data && (
          <div className="rounded-2xl border border-risk-high/30 bg-risk-high/5 p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-high/15 px-3 py-1 text-xs font-bold text-risk-high">
              <AlertTriangle className="h-3.5 w-3.5" />
              Risc ridicat de ceață
            </span>
            <div className="mt-3 text-xs font-medium text-slate-500">
              {flight.airlineName} · {flight.flightNumber}
            </div>
            <div className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
              {flight.originIata}
              <ArrowRight className="h-5 w-5 text-slate-400" />
              {flight.destinationIata}
            </div>
            <div className="text-sm text-slate-500">
              {formatDateTime(flight.scheduledDeparture)}
            </div>
            <div className="mt-4 border-t border-risk-high/15 pt-4">
              <RiskMeter risk={disruption.data.risk} />
            </div>
          </div>
        )}

        {/* Alternatives */}
        <h2 className="mb-3 mt-6 px-1 text-sm font-bold text-slate-900">
          {alternatives.data
            ? `${alternatives.data.length} alternative — sortate pentru tine`
            : "Caut alternative…"}
        </h2>

        <div className="space-y-3">
          {alternatives.isLoading &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-slate-200/70"
              />
            ))}

          {alternatives.data?.map((alt) => (
            <AlternativeCard
              key={alt.id}
              alternative={alt}
              onSelect={setConfirming}
              pending={select.isPending}
            />
          ))}
        </div>

        {/* Support */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Întrebări? Sună la suport.</div>
          <a
            href="tel:+40212014000"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <Phone className="h-4 w-4" />
            Sună TAROM
          </a>
        </div>
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Continui spre rezervare?
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Te trimitem către pagina de rezervare pentru „{confirming.title}”.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={select.isPending}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                Continuă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {selected && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <CheckCircle2 className="mx-auto h-12 w-12 text-risk-low" />
            <h3 className="mt-3 text-base font-bold text-slate-900">
              Am marcat această alternativă ca aleasă.
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">{selected.title}</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white"
            >
              Gata
            </button>
          </div>
        </div>
      )}
    </>
  );
}
