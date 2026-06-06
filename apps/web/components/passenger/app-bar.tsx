import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AppBar({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--gold-border)] px-4 pb-3 pt-[calc(theme(spacing.safe-top)+12px)] backdrop-blur-glass"
      style={{ background: "var(--appbar-bg)" }}
    >
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Înapoi"
          className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border-strong)] bg-white/60 text-accent-deep backdrop-blur-lg transition-transform duration-120 ease-cinematic hover:scale-95 active:scale-95"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </Link>
      ) : (
        <img
          src="/cine/fogora-mark-256.png"
          alt="Fogora"
          className="h-[26px] w-[26px] flex-shrink-0 rounded-icon object-contain"
        />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold leading-tight tracking-tight text-espresso">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs font-medium text-warm-muted">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
