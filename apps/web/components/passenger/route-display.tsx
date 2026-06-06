import type { FlightSummary } from "@aerly/shared";
import { Plane } from "lucide-react";

import { cn } from "@/lib/utils";

export function RouteDisplay({
  flight,
  big,
  className,
}: {
  flight: FlightSummary;
  /** Larger hero variant (disruption screen). */
  big?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-center gap-0", className)}>
      <div className="min-w-fit text-center">
        <div
          className={cn(
            "font-black leading-tight tracking-tight text-espresso",
            big ? "text-3xl" : "text-lg",
          )}
        >
          {flight.originIata}
        </div>
        <div
          className={cn(
            "mt-0.5 font-medium text-warm-muted",
            big ? "text-xs" : "text-[11px]",
          )}
        >
          {flight.originCity}
        </div>
      </div>

      <div className="mx-2 flex flex-1 items-center gap-1.5">
        <div className="h-px flex-1 bg-gradient-to-r from-accent-soft/60 to-accent-soft/10" />
        <Plane
          className={cn("flex-shrink-0 text-accent", big ? "h-5 w-5" : "h-4 w-4")}
        />
        <div className="h-px flex-1 bg-gradient-to-l from-accent-soft/60 to-accent-soft/10" />
      </div>

      <div className="min-w-fit text-center">
        <div
          className={cn(
            "font-black leading-tight tracking-tight text-espresso",
            big ? "text-3xl" : "text-lg",
          )}
        >
          {flight.destinationIata}
        </div>
        <div
          className={cn(
            "mt-0.5 font-medium text-warm-muted",
            big ? "text-xs" : "text-[11px]",
          )}
        >
          {flight.destinationCity}
        </div>
      </div>
    </div>
  );
}
