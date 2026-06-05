import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AppBar({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Înapoi"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <h1 className="flex-1 truncate text-lg font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      {action}
    </header>
  );
}
