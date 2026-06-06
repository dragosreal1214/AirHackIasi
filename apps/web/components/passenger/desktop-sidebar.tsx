"use client";

import { Building2, Code2, Home, LifeBuoy, Luggage, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Acasă", icon: Home },
  { href: "/trips", label: "Călătorii", icon: Luggage },
  { href: "/help", label: "Ajutor", icon: LifeBuoy },
  { href: "/hotels", label: "Hoteluri", icon: Building2 },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/developers", label: "API & date", icon: Code2 },
];

/** Left sidebar shown on desktop (lg+); the bottom nav covers mobile. */
export function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col lg:gap-1 lg:border-r lg:border-[color:var(--gold-border)] lg:px-4 lg:py-6"
      style={{ background: "var(--surface)" }}
    >
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
        <img
          src="/cine/fogora-mark-256.png"
          alt="Fogora"
          className="h-9 w-9 rounded-icon object-contain"
        />
        <span className="font-display text-2xl leading-none tracking-tight text-espresso">
          Fogora
        </span>
      </Link>

      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-semibold tracking-tight transition-colors duration-150",
              active
                ? "bg-accent/[0.15] text-accent-deep"
                : "text-warm-ink hover:bg-accent/[0.08]",
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={active ? 2.3 : 2} />
            {label}
          </Link>
        );
      })}

      <p className="mt-auto px-3 text-[11px] font-medium text-warm-faint">
        Fogora · Copilotul tău calm.
      </p>
    </aside>
  );
}
