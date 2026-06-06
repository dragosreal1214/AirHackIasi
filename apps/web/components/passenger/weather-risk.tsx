"use client";

import type { CurrentRisk } from "@aerly/shared";
import { Cloud, CloudFog, Wind } from "lucide-react";

import { riskPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface GaugeProps {
  icon: React.ReactNode;
  label: string;
  /** 0..100 */
  value: number;
  /** Caption under the value — e.g. a percent, or "demo" for placeholders. */
  caption: string;
  /** Marks the gauge as a non-bound demo placeholder. */
  placeholder?: boolean;
}

function RiskGauge({ icon, label, value, caption, placeholder }: GaugeProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sky/90">
        <span className="flex h-7 w-7 items-center justify-center rounded-icon bg-white/[0.08] text-sky">
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky/80">
          {label}
        </span>
        {placeholder && (
          <span className="ml-auto rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-sky/50">
            demo
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.1]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-180 ease-cinematic",
            placeholder
              ? "bg-gradient-to-r from-sky-deep/50 to-sky/50"
              : "bg-gradient-to-r from-sky-deep to-sky",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-sky/70">
        {caption}
      </span>
    </div>
  );
}

export function WeatherRiskPanel({
  risk,
  destinationRisk,
  destinationIata,
}: {
  risk: CurrentRisk;
  destinationRisk?: CurrentRisk | null;
  destinationIata?: string;
}) {
  const fogPct = riskPercent(risk.probability);
  const destFogPct = destinationRisk ? riskPercent(destinationRisk.probability) : 0;

  return (
    <div
      className="overflow-hidden rounded-card border border-white/[0.08] p-5 text-ivory shadow-glass"
      style={{
        background:
          "radial-gradient(120% 100% at 0% 0%, #2E5C82 0%, #1f3f5c 45%, #15293b 100%)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <CloudFog className="h-4 w-4 text-sky" strokeWidth={2} />
        <h3 className="font-display text-lg leading-tight tracking-tight text-ivory">
          Condiții meteo &amp; risc
        </h3>
      </div>

      <div className="space-y-4">
        {/* Real, bound to risk.probability */}
        <RiskGauge
          icon={<CloudFog className="h-4 w-4" strokeWidth={2} />}
          label="Risc de ceață"
          value={fogPct}
          caption={`${fogPct}% probabilitate`}
        />

        {/* Real, bound to destinationRisk.probability — hidden when null */}
        {destinationRisk && (
          <RiskGauge
            icon={<CloudFog className="h-4 w-4" strokeWidth={2} />}
            label={`Ceață la destinație (${destinationIata})`}
            value={destFogPct}
            caption={`${destFogPct}% probabilitate`}
          />
        )}

        {/* Placeholders — our types carry only one probability */}
        <RiskGauge
          icon={<Cloud className="h-4 w-4" strokeWidth={2} />}
          label="Vreme rea"
          value={42}
          caption="estimare demo"
          placeholder
        />
        <RiskGauge
          icon={<Wind className="h-4 w-4" strokeWidth={2} />}
          label="Risc general"
          value={58}
          caption="estimare demo"
          placeholder
        />
      </div>
    </div>
  );
}
