"use client";

import { Bell } from "lucide-react";

import { AppBar } from "@/components/passenger/app-bar";
import { EmptyState } from "@/components/passenger/empty-state";
import { RiskBadge } from "@/components/shared/risk-badge";
import { formatDateTime } from "@/lib/format";
import { usePnrs } from "@/hooks/use-pnrs";

export default function NotificationsPage() {
  const { data: pnrs } = usePnrs("active");
  const alerts = pnrs?.filter((p) => p.disruptionId && p.currentRisk) ?? [];

  return (
    <>
      <AppBar title="Notificări" />
      <div className="px-4 py-4">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-7 w-7" />}
            title="Nicio notificare"
            description="Te anunțăm aici (și pe WhatsApp) când un zbor al tău e la risc."
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((p) => (
              <a
                key={p.id}
                href={`/d/${p.disruptionId}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    {p.flight.flightNumber} · {p.flight.originIata} → {p.flight.destinationIata}
                  </span>
                  {p.currentRisk && <RiskBadge level={p.currentRisk.level} />}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Risc de ceață la plecare · {formatDateTime(p.flight.scheduledDeparture)}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
