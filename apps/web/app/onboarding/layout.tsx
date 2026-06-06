import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-espresso lg:flex">
      {/* Desktop-only left brand panel */}
      <aside className="relative hidden lg:flex lg:w-[52%] lg:flex-col lg:overflow-hidden">
        <img
          src="/cine/login-plane-window.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[50%_46%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,12,7,0.72) 0%, rgba(18,12,7,0.34) 38%, rgba(20,14,8,0.42) 72%, rgba(18,12,7,0.82) 100%)",
          }}
        />

        {/* Brand at top */}
        <div className="relative z-[1] flex items-center gap-3 px-12 pt-12">
          <img
            src="/cine/fogora-mark-256.png"
            alt="Fogora"
            className="h-12 w-12 object-contain drop-shadow-[0_6px_22px_rgba(0,0,0,0.5)]"
          />
          <span className="font-display text-2xl tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">
            Fogora
          </span>
        </div>

        {/* Headline + subline near bottom */}
        <div className="relative z-[1] mt-auto px-12 pb-14">
          <h1 className="font-display text-[2.8rem] leading-[1.05] tracking-[0.01em] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.55)]">
            Cu un pas <span className="italic text-sky">înaintea ceții.</span>
          </h1>
          <p className="mt-5 max-w-[30ch] text-base leading-[1.55] text-white/80 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)]">
            Copilotul tău calm — alerte de ceață, alternative reale și pașii următori, într-un singur loc.
          </p>
        </div>
      </aside>

      {/* Right column (desktop) / full column (mobile) */}
      <div className="lg:flex lg:flex-1 lg:items-center lg:justify-center lg:overflow-y-auto lg:bg-cream lg:py-12">
        <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-ivory lg:min-h-0 lg:w-full lg:overflow-visible lg:bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
