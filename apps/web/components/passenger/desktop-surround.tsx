import { Bell, Route, Scale } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Bell,
    title: "Alerte de ceață",
    body: "Te anunțăm cu 3–5 ore înainte, calm și la timp.",
  },
  {
    icon: Route,
    title: "Alternative reale",
    body: "Tren, zbor sau rerutare — clasate pentru tine.",
  },
  {
    icon: Scale,
    title: "Drepturi & compensații",
    body: "Știi exact ce ți se cuvine, fără bătăi de cap.",
  },
];

/**
 * Ambient branded panel shown only on lg+ screens, sitting beside the
 * centered app column. Hidden entirely below lg so mobile stays untouched.
 */
export function DesktopSurround() {
  return (
    <aside
      className={cn(
        "hidden flex-col justify-between text-ivory lg:flex",
        "animate-c-fade-up",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-icon border border-[color:var(--gold-border)] bg-white/[0.04] shadow-glass">
          <Image
            src="/cine/fogora-mark-256.png"
            alt="Fogora"
            width={48}
            height={48}
            className="h-9 w-9 object-contain"
            priority
          />
        </span>
        <span className="font-display text-3xl tracking-tight text-ivory">
          Fogora
        </span>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-ivory">
            Copilotul tău calm.
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-warm-faint">
            Când ceața închide aeroportul din Iași, Fogora te anunță din timp și
            îți pune alternativele la îndemână — fără panică, fără cozi.
          </p>
        </div>

        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-icon border border-[color:var(--gold-border)] bg-accent/10 text-accent-soft">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-ivory">{title}</p>
                <p className="text-sm leading-snug text-warm-faint">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs font-medium uppercase tracking-[0.18em] text-warm-muted">
        Cu un aer înainte.
      </p>
    </aside>
  );
}
