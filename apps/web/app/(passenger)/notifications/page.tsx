"use client";

import { Bell } from "lucide-react";

import { AppBar } from "@/components/passenger/app-bar";
import { EmptyState } from "@/components/passenger/empty-state";
import { RiskBadge } from "@/components/shared/risk-badge";
import { GoldCard } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { usePnrs } from "@/hooks/use-pnrs";

export default function NotificationsPage() {
  const { data: pnrs } = usePnrs("active");
  const alerts = pnrs?.filter((p) => p.disruptionId && p.currentRisk) ?? [];

  return (
    <>
      <AppBar title="Notificări" />
      <div className="animate-fade-up px-4 py-5">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-7 w-7" />}
            title="Nicio notificare"
            description="Te anunțăm aici (și pe WhatsApp) când un zbor al tău e la risc."
          />
        ) : (
          <>
            <h1 className="mb-4 font-display text-3xl leading-tight tracking-tight text-espresso">
              Alerte active
            </h1>
            <div className="space-y-3">
              {alerts.map((p) => (
                <a key={p.id} href={`/d/${p.disruptionId}`} className="block">
                  <GoldCard interactive elevated className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold tracking-tight text-espresso">
                        {p.flight.flightNumber} · {p.flight.originIata} → {p.flight.destinationIata}
                      </span>
                      {p.currentRisk && <RiskBadge level={p.currentRisk.level} />}
                    </div>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-warm-muted">
                      Risc de ceață la plecare · {formatDateTime(p.flight.scheduledDeparture)}
                    </p>
                  </GoldCard>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
