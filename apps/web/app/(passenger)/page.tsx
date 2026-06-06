"use client";

import {
  ArrowUpRight,
  FileText,
  type LucideIcon,
  LifeBuoy,
  Luggage,
  Plane,
  Sparkles,
  User,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";

import { getMe, getPnrs } from "@/lib/api";
import { pnrKeys } from "@/hooks/use-pnrs";
import { cn } from "@/lib/utils";

type MenuItem = {
  href: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  tone: "sand" | "sky";
};

const MENU: MenuItem[] = [
  {
    href: "/trips",
    icon: Luggage,
    title: "Călătoriile mele",
    sub: "Viitoare & trecute",
    tone: "sand",
  },
  {
    href: "/help",
    icon: LifeBuoy,
    title: "Ajutor perturbări",
    sub: "Întârziat sau anulat?",
    tone: "sky",
  },
  {
    href: "/compensation",
    icon: FileText,
    title: "Compensație",
    sub: "Îți știi drepturile",
    tone: "sand",
  },
  {
    href: "/profile",
    icon: User,
    title: "Profil",
    sub: "Cont & alerte",
    tone: "sky",
  },
];

export default function HomePage() {
  const qc = useQueryClient();

  // Warm the most-used screens so the bottom-nav tabs open instantly.
  useEffect(() => {
    qc.prefetchQuery({ queryKey: pnrKeys.list("active"), queryFn: () => getPnrs("active") });
    qc.prefetchQuery({ queryKey: ["me"], queryFn: getMe });
  }, [qc]);

  return (
    <div
      className="no-sb relative min-h-full overflow-y-auto"
      style={{
        background:
          "linear-gradient(180deg, #E7F0F8 0%, var(--background) 40%, rgb(var(--color-cream)) 72%, #EBE0CB 100%)",
      }}
    >
      {/* soft sky glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -20%, rgba(156,196,228,0.5) 0%, transparent 60%)",
        }}
      />

      <div className="relative px-5 pb-[calc(theme(spacing.safe-bottom)+24px)] pt-[calc(theme(spacing.safe-top)+16px)]">
        {/* brand wordmark */}
        <div className="animate-c-fade-up mb-5 flex items-center gap-3">
          <img
            src="/cine/fogora-mark-256.png"
            alt="Fogora"
            className="h-[56px] w-[56px] rounded-icon object-contain drop-shadow-[0_4px_14px_rgba(168,132,47,0.25)]"
          />
          <span className="font-display text-[36px] leading-none tracking-tight text-espresso">
            Fogora
          </span>
        </div>

        {/* header */}
        <div className="animate-c-fade-up flex items-center justify-between [animation-delay:40ms]">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-sky-ink">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
              Cer senin azi
            </span>
            <h1 className="font-display text-[28px] leading-[1.08] text-espresso">
              Bun venit
            </h1>
          </div>
        </div>

        {/* primary action card */}
        <Link
          href="/flights/add"
          className="animate-c-fade-up relative mt-[22px] block overflow-hidden rounded-[24px] p-[22px] [animation-delay:60ms]"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--color-accent-soft)) 0%, rgb(var(--color-accent)) 52%, rgb(var(--color-accent-deep)) 100%)",
            border: "1px solid rgba(200,162,78,0.35)",
            boxShadow:
              "0 2px 0 rgba(255,255,255,0.32) inset, inset 0 0 0 0.5px rgba(200,162,78,0.18), 0 14px 34px rgba(168,132,47,0.30)",
          }}
        >
          {/* circle embellishment */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-7 -top-7 h-[150px] w-[150px] rounded-full bg-white/[0.16]"
          />
          <div className="absolute right-[18px] top-[18px] text-espresso/50">
            <ArrowUpRight className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <span className="grid h-[50px] w-[50px] place-items-center rounded-[16px] border border-espresso/[0.12] bg-espresso/[0.14] text-espresso">
            <Plane className="h-[26px] w-[26px]" strokeWidth={1.7} />
          </span>
          <div className="mt-10">
            <div className="font-display text-[26px] leading-[1.05] text-espresso">
              Verifică un zbor
            </div>
            <div className="mt-1 text-[13px] font-medium leading-snug text-espresso/[0.72]">
              Status &amp; risc de perturbare în timp real
            </div>
          </div>
        </Link>

        {/* gold gradient divider */}
        <div
          aria-hidden
          className="my-[15px] h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(200,162,78,0.2) 30%, rgba(200,162,78,0.2) 70%, transparent)",
          }}
        />

        {/* menu grid */}
        <div className="grid grid-cols-2 gap-3">
          {MENU.map((item, i) => (
            <MenuCard key={item.href} item={item} delay={0.12 + i * 0.06} />
          ))}
        </div>

        {/* footer note */}
        <p className="animate-c-fade-up mt-[22px] text-center text-[12px] font-normal leading-relaxed text-warm-faint [animation-delay:400ms]">
          Fogora veghează ca tu să nu fie nevoie.
        </p>
      </div>
    </div>
  );
}

function MenuCard({ item, delay }: { item: MenuItem; delay: number }) {
  const { icon: Icon, tone } = item;
  const tints =
    tone === "sky"
      ? { ic: "text-sky-ink", icbg: "bg-sky/[0.32]" }
      : { ic: "text-warm-ink", icbg: "bg-[rgba(205,183,146,0.30)]" };

  return (
    <Link
      href={item.href}
      className="animate-c-fade-up flex min-h-[132px] flex-col justify-between rounded-[20px] border border-[color:var(--gold-border)] bg-white/50 p-[18px] backdrop-blur-glass transition-transform duration-150 ease-cinematic active:scale-[0.97]"
      style={{
        animationDelay: `${delay}s`,
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.5) inset, inset 0 0 0 0.5px rgba(200,162,78,0.10), 0 8px 22px rgba(33,24,14,0.08)",
      }}
    >
      <span
        className={cn(
          "grid h-[46px] w-[46px] place-items-center rounded-[14px]",
          tints.icbg,
          tints.ic,
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <div>
        <div className="text-[16px] font-semibold leading-[1.15] text-espresso">
          {item.title}
        </div>
        <div className="mt-0.5 text-[12px] font-normal leading-snug text-warm-muted">
          {item.sub}
        </div>
      </div>
    </Link>
  );
}
