import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex animate-fade-up flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-card border border-[var(--gold-border-strong)] bg-accent/[0.12] text-accent-deep shadow-glass">
        {icon}
      </div>
      <h2 className="mt-5 font-display text-2xl leading-tight tracking-tight text-espresso">
        {title}
      </h2>
      <p className="mt-2 max-w-xs text-sm font-medium leading-relaxed text-warm-muted">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
