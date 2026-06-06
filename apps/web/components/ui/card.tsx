import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GoldCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Active state — adds the stronger gold border treatment. */
  active?: boolean;
  /** Elevated / strong glass: ivory-dominant background + stronger border. */
  elevated?: boolean;
  /** Interactive — adds press-scale feedback. */
  interactive?: boolean;
}

export const GoldCard = forwardRef<HTMLDivElement, GoldCardProps>(
  ({ active, elevated, interactive, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card shadow-glass backdrop-blur-glass transition-all duration-150 ease-cinematic",
          elevated
            ? "bg-ivory/90 border border-[color:var(--gold-border-strong)]"
            : "bg-white/[0.52] border border-[color:var(--gold-border)]",
          active && "border-[color:var(--gold-border-strong)]",
          interactive && "cursor-pointer active:scale-[0.98]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GoldCard.displayName = "GoldCard";
