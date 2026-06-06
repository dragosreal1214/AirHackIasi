"use client";

import { Bell, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Acasă", icon: Home },
  { href: "/notifications", label: "Notificări", icon: Bell },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-20 border-t border-[var(--gold-border)] pb-safe-bottom backdrop-blur-xl"
      style={{ background: "var(--bottomnav-bg)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around pt-1.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 pb-1 pt-0.5 text-[11px] tracking-tight transition-colors duration-180",
                  active
                    ? "font-bold text-accent-deep"
                    : "font-medium text-warm-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-9 items-center justify-center rounded-lg transition-colors duration-180",
                    active ? "bg-accent/[0.18]" : "bg-transparent",
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.3 : 1.9}
                  />
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
