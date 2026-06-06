import type { ReactNode } from "react";

import { OpsNav } from "@/components/ops/ops-nav";

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <OpsNav />
        {children}
      </div>
    </div>
  );
}
