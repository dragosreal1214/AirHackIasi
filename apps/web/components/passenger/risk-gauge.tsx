import type { ReactNode } from "react";
import type { RiskLevel } from "@aerly/shared";

import { riskPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const LEVEL_WORD: Record<RiskLevel, string> = {
  low: "Scăzut",
  moderate: "Moderat",
  high: "Ridicat",
  critical: "Critic",
};

/** Inline stroke color per risk level (uses CSS token RGB triplets). */
const LEVEL_STROKE: Record<RiskLevel, string> = {
  low: "rgb(var(--color-risk-low))",
  moderate: "rgb(var(--color-risk-moderate))",
  high: "rgb(var(--color-risk-high))",
  critical: "rgb(var(--color-risk-critical))",
};

const LEVEL_TEXT: Record<RiskLevel, string> = {
  low: "text-risk-low",
  moderate: "text-risk-moderate",
  high: "text-risk-high",
  critical: "text-risk-critical",
};

/**
 * Circular SVG progress ring for a single weather risk gauge.
 * Shows the percentage in the center, with a label + level word + icon below.
 */
export function RiskGauge({
  value,
  level,
  label,
  icon,
}: {
  /** 0..1 */
  value: number;
  level: RiskLevel;
  label: string;
  icon?: ReactNode;
}) {
  const pct = riskPercent(value);
  const size = 84;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={LEVEL_STROKE[level]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            className="transition-[stroke-dasharray] duration-500 ease-cinematic"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-bold tabular-nums text-ivory">
          {pct}%
        </span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-ivory/85">
          {icon}
          {label}
        </span>
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.1em]",
            LEVEL_TEXT[level],
          )}
        >
          {LEVEL_WORD[level]}
        </span>
      </div>
    </div>
  );
}
