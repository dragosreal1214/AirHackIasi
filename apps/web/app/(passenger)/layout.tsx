import type { ReactNode } from "react";

import { AuthGuard } from "@/components/passenger/auth-guard";
import { BottomNav } from "@/components/passenger/bottom-nav";

export default function PassengerLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "var(--backdrop)" }}
    >
      <div
        className="mx-auto flex min-h-screen max-w-md flex-col text-espresso shadow-glass"
        style={{ background: "var(--surface)" }}
      >
        <AuthGuard>
          <div className="flex flex-1 flex-col">{children}</div>
          <BottomNav />
        </AuthGuard>
      </div>
    </div>
  );
}
