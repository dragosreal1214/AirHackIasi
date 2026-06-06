import type { CurrentRisk } from "@aerly/shared";

import { formatTime, RISK_META, riskPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RiskMeter({ risk }: { risk: CurrentRisk }) {
  const meta = RISK_META[risk.level];
  const pct = riskPercent(risk.probability);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.12em]",
            meta.text,
          )}
        >
          {meta.label}
        </span>
        <span className="font-display text-3xl leading-none tabular-nums text-espresso">
          {pct}%
        </span>
      </div>
      <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-warm-faint/30">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-180 ease-cinematic",
            meta.solid,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {risk.fogWindow && (
        <p className="mt-2.5 text-xs text-warm-muted">
          Fereastră de ceață estimată:{" "}
          <span className="font-semibold text-warm-ink">
            {formatTime(risk.fogWindow.start)}–{formatTime(risk.fogWindow.end)}
          </span>
        </p>
      )}
      {risk.explanation && (
        <p className="mt-2.5 rounded-input border border-[color:var(--gold-border)] bg-white/50 px-3 py-2 text-xs text-warm-ink">
          🤖 {risk.explanation}
        </p>
      )}
    </div>
  );
}
