import type { ReactNode } from "react";

import { AuthGuard } from "@/components/passenger/auth-guard";
import { BottomNav } from "@/components/passenger/bottom-nav";

export default function PassengerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 shadow-xl">
        <AuthGuard>
          <div className="flex-1 pb-2">{children}</div>
          <BottomNav />
        </AuthGuard>
      </div>
    </div>
  );
}
