"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/ops", label: "Monitor ceață" },
  { href: "/ops/board", label: "Risc zboruri" },
];

export function OpsNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      {TABS.map((tab) => {
        const active =
          tab.href === "/ops"
            ? pathname === "/ops"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
