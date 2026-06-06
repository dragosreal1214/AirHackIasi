import type { ReactNode } from "react";

import { AuthGuard } from "@/components/passenger/auth-guard";
import { BottomNav } from "@/components/passenger/bottom-nav";
import { DesktopSurround } from "@/components/passenger/desktop-surround";

export default function PassengerLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen w-full lg:flex lg:items-center lg:justify-center lg:overflow-hidden lg:p-10"
      style={{ background: "var(--backdrop)" }}
    >
      {/* Ambient soft glow — lg+ only, sits behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(50% 60% at 18% 30%, rgba(200,162,78,0.16) 0%, rgba(200,162,78,0) 60%), radial-gradient(55% 65% at 82% 75%, rgba(91,143,191,0.14) 0%, rgba(91,143,191,0) 60%)",
        }}
      />

      <div className="lg:relative lg:grid lg:w-full lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center lg:gap-12">
        <DesktopSurround />

        <div
          className="mx-auto flex min-h-screen max-w-md flex-col text-espresso shadow-glass lg:my-6 lg:h-[calc(100vh-3rem)] lg:min-h-0 lg:overflow-y-auto lg:rounded-[28px]"
          style={{ background: "var(--surface)" }}
        >
          <AuthGuard>
            <div className="flex flex-1 flex-col">{children}</div>
            <BottomNav />
          </AuthGuard>
        </div>
      </div>
    </div>
  );
}
