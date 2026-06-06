import { cn } from "@/lib/utils";

export interface CWordProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Light variant for use over dark backdrops. */
  light?: boolean;
  /** Icon circle diameter in px. Text scales with it. */
  size?: number;
}

export function CWord({ light, size = 32, className, ...props }: CWordProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      {...props}
    >
      <span
        style={{ width: size, height: size }}
        className={cn(
          "grid shrink-0 place-items-center rounded-full",
          light
            ? "border border-white/40 bg-white/[0.16] backdrop-blur-glass"
            : "bg-gradient-to-br from-accent-soft to-accent-deep shadow-[0_6px_20px_rgba(168,132,47,0.35)]",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "h-1/3 w-1/3 rounded-full",
            light ? "bg-white" : "bg-ivory",
          )}
        />
      </span>
      <span
        className={cn(
          "font-display leading-tight tracking-tight",
          light
            ? "text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]"
            : "text-espresso",
        )}
        style={{ fontSize: size * 0.85 }}
      >
        Aerly
      </span>
    </div>
  );
}
