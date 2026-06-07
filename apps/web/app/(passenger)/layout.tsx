import type { ReactNode } from "react";

import { AuthGuard } from "@/components/passenger/auth-guard";
import { BottomNav } from "@/components/passenger/bottom-nav";
import { DemoTrigger } from "@/components/passenger/demo-trigger";
import { DesktopSidebar } from "@/components/passenger/desktop-sidebar";

export default function PassengerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full lg:flex" style={{ background: "var(--backdrop)" }}>
      {/* Desktop: a real left-sidebar layout. Mobile: a single centered column + bottom nav. */}
      <DesktopSidebar />

      <div
        className="mx-auto flex min-h-screen w-full max-w-md flex-col text-espresso shadow-glass lg:mx-0 lg:max-w-none lg:flex-1 lg:shadow-none"
        style={{ background: "var(--surface)" }}
      >
        <AuthGuard>
          <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-4xl">
            {children}
          </div>
          <BottomNav />
          <DemoTrigger />
        </AuthGuard>
      </div>
    </div>
  );
}
