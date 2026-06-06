"use client";

import { Building2, Home, LifeBuoy, Luggage, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Acasă", icon: Home },
  { href: "/trips", label: "Călătorii", icon: Luggage },
  { href: "/help", label: "Ajutor", icon: LifeBuoy },
  { href: "/hotels", label: "Hoteluri", icon: Building2 },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-20 border-t border-[color:var(--gold-border)] pb-safe-bottom backdrop-blur-glass"
      style={{ background: "var(--bottomnav-bg)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-1.5 pt-1.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-icon py-1.5 text-[10px] font-semibold tracking-tight transition-colors duration-150 ease-cinematic",
                  active ? "text-accent-deep" : "text-warm-faint",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-icon transition-all duration-150 ease-cinematic",
                    active
                      ? "bg-accent/15 shadow-[inset_0_0_0_1px_var(--gold-border)]"
                      : "bg-transparent",
                  )}
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.3 : 2} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
