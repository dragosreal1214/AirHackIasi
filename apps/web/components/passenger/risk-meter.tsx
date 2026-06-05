import type { CurrentRisk } from "@aerly/shared";

import { formatTime, RISK_META, riskPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RiskMeter({ risk }: { risk: CurrentRisk }) {
  const meta = RISK_META[risk.level];
  const pct = riskPercent(risk.probability);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={cn("text-sm font-semibold", meta.text)}>
          {meta.label}
        </span>
        <span className="text-2xl font-bold tabular-nums text-slate-900">
          {pct}%
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200/70">
        <div
          className={cn("h-full rounded-full transition-all", meta.solid)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {risk.fogWindow && (
        <p className="mt-2 text-xs text-slate-500">
          Fereastră de ceață estimată:{" "}
          <span className="font-medium text-slate-700">
            {formatTime(risk.fogWindow.start)}–{formatTime(risk.fogWindow.end)}
          </span>
        </p>
      )}
    </div>
  );
}
