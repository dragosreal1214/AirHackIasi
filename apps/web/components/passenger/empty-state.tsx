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
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
