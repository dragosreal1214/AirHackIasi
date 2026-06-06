import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-espresso">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-ivory">
        {children}
      </div>
    </div>
  );
}
