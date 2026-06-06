"use client";

import type { NotificationChannel } from "@aerly/shared";
import {
  Building2,
  Calculator,
  ChevronRight,
  HelpCircle,
  LogOut,
  type LucideIcon,
  Mail,
  MessageCircle,
  Phone,
  Smartphone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { useMe, useUpdateMe } from "@/hooks/use-me";
import { clearTokens } from "@/lib/auth";
import { cn } from "@/lib/utils";

const CHANNELS: {
  channel: NotificationChannel;
  icon: LucideIcon;
  label: string;
  note: string;
}[] = [
  { channel: "whatsapp", icon: MessageCircle, label: "WhatsApp", note: "Recomandat" },
  { channel: "sms", icon: Smartphone, label: "SMS", note: "Backup" },
  { channel: "push", icon: User, label: "Push", note: "În aplicație" },
];

function initials(name?: string) {
  if (!name) return "··";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-7 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-warm-faint">
      {children}
    </h2>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block animate-shimmer rounded-full bg-warm-faint/20 align-middle",
        className,
      )}
    />
  );
}

function PRow({
  icon: Icon,
  label,
  value,
  trailing,
  href,
  last,
}: {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  last?: boolean;
}) {
  const content = (
    <>
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border)] bg-accent/[0.12] text-accent-deep shadow-glass">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-[15px] font-semibold leading-tight text-espresso">
        {label}
      </span>
      {value && (
        <span className="truncate text-xs font-medium text-warm-muted">{value}</span>
      )}
      {trailing ??
        (href ? (
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-warm-faint" strokeWidth={2.2} />
        ) : null)}
    </>
  );

  const rowClass = cn(
    "flex min-h-[52px] items-center gap-3 px-4 py-3",
    !last && "border-b border-[var(--gold-border)]",
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          rowClass,
          "transition-transform duration-120 ease-cinematic active:scale-[0.985]",
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={rowClass}>{content}</div>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();

  const channels = me?.notificationChannels ?? [];

  function toggleChannel(channel: NotificationChannel) {
    if (!me) return;
    const next = channels.includes(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel];
    updateMe.mutate({ notificationChannels: next });
  }

  function logout() {
    clearTokens();
    router.replace("/onboarding/login");
  }

  return (
    <>
      <AppBar title="Profil" subtitle="Contul tău Fogora" />
      <div className="px-4 pb-10 pt-5">
        {/* Avatar */}
        <div className="flex animate-c-fade-up flex-col items-center text-center">
          <div className="rounded-full bg-gradient-to-br from-accent-soft via-accent to-accent-deep p-[2.5px] shadow-gold-button">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-ivory text-2xl font-bold tracking-tight text-espresso">
              {isLoading ? <Shimmer className="h-7 w-10 rounded-md" /> : initials(me?.fullName)}
            </div>
          </div>
          <h2 className="mt-4 font-display text-[26px] leading-none tracking-tight text-espresso">
            {isLoading ? (
              <Shimmer className="h-6 w-40 rounded-md" />
            ) : (
              me?.fullName ?? "Călător Fogora"
            )}
          </h2>
          <p className="mt-1.5 text-sm font-medium text-warm-muted">
            {isLoading ? <Shimmer className="h-4 w-32 rounded" /> : me?.phoneNumber}
          </p>
        </div>

        {/* Personal */}
        <div className="animate-c-fade-up" style={{ animationDelay: "70ms" }}>
          <SectionLabel>Personal</SectionLabel>
          <GoldCard elevated className="overflow-hidden p-0">
          <PRow
            icon={User}
            label="Nume"
            value={isLoading ? <Shimmer className="h-3.5 w-24 rounded" /> : me?.fullName ?? "—"}
          />
          <PRow
            icon={Phone}
            label="Telefon"
            value={isLoading ? <Shimmer className="h-3.5 w-28 rounded" /> : me?.phoneNumber}
          />
          <PRow
            icon={Mail}
            label="Email"
            value={isLoading ? <Shimmer className="h-3.5 w-20 rounded" /> : me?.email ?? "Adaugă"}
            href={me?.email ? undefined : "#"}
            last
          />
          </GoldCard>
        </div>

        {/* Canale */}
        <div className="animate-c-fade-up" style={{ animationDelay: "140ms" }}>
          <SectionLabel>Canale de notificare</SectionLabel>
          <GoldCard className="overflow-hidden p-0">
          {CHANNELS.map(({ channel, icon, label, note }, i) => {
            const on = channels.includes(channel);
            return (
              <PRow
                key={channel}
                icon={icon}
                label={label}
                value={note}
                last={i === CHANNELS.length - 1}
                trailing={
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`Notificări ${label}`}
                    disabled={isLoading || !me}
                    onClick={() => toggleChannel(channel)}
                    className={cn(
                      "h-5 w-9 flex-shrink-0 rounded-full p-0.5 transition-colors duration-150 ease-cinematic active:scale-95 disabled:opacity-50",
                      on ? "bg-accent" : "bg-warm-faint/30",
                    )}
                  >
                    <span
                      className={cn(
                        "block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-cinematic",
                        on && "translate-x-4",
                      )}
                    />
                  </button>
                }
              />
            );
          })}
          </GoldCard>
        </div>

        {/* Mai multe */}
        <div className="animate-c-fade-up" style={{ animationDelay: "210ms" }}>
          <SectionLabel>Mai multe</SectionLabel>
          <GoldCard className="overflow-hidden p-0">
          <PRow icon={Building2} label="Hoteluri partenere" href="/hotels" />
          <PRow icon={Calculator} label="Calculează compensația" href="/compensation" />
          <PRow icon={HelpCircle} label="Ajutor & întrebări" href="/help" last />
          </GoldCard>
        </div>

        {/* Cont */}
        <div className="animate-c-fade-up" style={{ animationDelay: "280ms" }}>
          <SectionLabel>Cont</SectionLabel>
          <CButton
            variant="ghost"
            full
            onClick={logout}
            className="h-12 gap-2 rounded-card border border-[var(--gold-border)] bg-ivory/70 text-sm text-warm-ink shadow-glass active:scale-[0.985]"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.2} />
            Deconectează-te
          </CButton>
        </div>

        <p className="mt-7 px-1 text-center text-xs font-medium text-warm-faint">
          Fogora · Copilotul tău calm.
        </p>
      </div>
    </>
  );
}
