import type { RiskLevel } from "@aerly/shared";

import { RISK_META } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel;
  className?: string;
}) {
  const meta = RISK_META[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight",
        meta.bg,
        meta.text,
        meta.border,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", meta.solid)} />
      {meta.label}
    </span>
  );
}
