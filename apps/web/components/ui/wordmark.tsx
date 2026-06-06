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
      <img
        src="/cine/fogora-mark.png"
        alt=""
        aria-hidden
        style={{ width: size, height: size }}
        className="shrink-0 rounded-icon object-contain"
      />
      <span
        className={cn(
          "font-display leading-tight tracking-tight",
          light
            ? "text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]"
            : "text-espresso",
        )}
        style={{ fontSize: size * 0.85 }}
      >
        Fogora
      </span>
    </div>
  );
}
