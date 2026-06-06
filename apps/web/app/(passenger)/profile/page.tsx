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
import { type ReactNode, useState } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { useMe, useUpdateMe } from "@/hooks/use-me";
import { clearTokens } from "@/lib/auth";
import { subscribeToPush } from "@/lib/push";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function EditableRow({
  icon: Icon,
  label,
  value,
  emptyLabel,
  loading,
  type = "text",
  placeholder,
  validate,
  onSave,
  saving,
  last,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  emptyLabel: string;
  loading?: boolean;
  type?: "text" | "email";
  placeholder?: string;
  validate?: (v: string) => string | null;
  onSave: (value: string) => void;
  saving?: boolean;
  last?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);

  function open() {
    setDraft(value ?? "");
    setError(null);
    setEditing(true);
  }

  function save() {
    const trimmed = draft.trim();
    const err = validate?.(trimmed) ?? null;
    if (err) {
      setError(err);
      return;
    }
    onSave(trimmed);
    setEditing(false);
  }

  const rowClass = cn(
    "px-4 py-3",
    !last && "border-b border-[var(--gold-border)]",
  );

  if (editing) {
    return (
      <div className={rowClass}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border)] bg-accent/[0.12] text-accent-deep shadow-glass">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 text-[15px] font-semibold leading-tight text-espresso">
            {label}
          </span>
        </div>
        <div className="mt-3">
          <TextField
            autoFocus
            type={type}
            inputMode={type === "email" ? "email" : "text"}
            value={draft}
            placeholder={placeholder}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
          />
          {error && (
            <p className="mt-1.5 px-1 text-xs font-medium text-risk-critical">{error}</p>
          )}
          <div className="mt-2.5 flex gap-2">
            <CButton
              size="md"
              full
              className="h-11"
              disabled={saving}
              onClick={save}
            >
              {saving ? "Se salvează…" : "Salvează"}
            </CButton>
            <CButton
              variant="ghost"
              size="md"
              className="h-11 px-4 text-sm text-warm-muted"
              disabled={saving}
              onClick={() => setEditing(false)}
            >
              Anulează
            </CButton>
          </div>
        </div>
      </div>
    );
  }

  const filled = Boolean(value);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={open}
      className={cn(
        rowClass,
        "flex min-h-[52px] w-full items-center gap-3 text-left transition-transform duration-120 ease-cinematic active:scale-[0.985] disabled:active:scale-100",
      )}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border)] bg-accent/[0.12] text-accent-deep shadow-glass">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight text-espresso">
          {label}
        </span>
        {loading ? (
          <Shimmer className="mt-1 h-3 w-24 rounded" />
        ) : (
          <span
            className={cn(
              "mt-0.5 block truncate text-xs font-medium",
              filled ? "text-warm-muted" : "text-accent-deep",
            )}
          >
            {filled ? value : emptyLabel}
          </span>
        )}
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-warm-faint" strokeWidth={2.2} />
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();

  const [pushNote, setPushNote] = useState<string | null>(null);
  // Optimistic override: the toggle flips instantly and reverts on error.
  const [override, setOverride] = useState<NotificationChannel[] | null>(null);
  const channels = override ?? me?.notificationChannels ?? [];

  async function toggleChannel(channel: NotificationChannel) {
    if (!me) return;
    const prev = channels;
    const isOn = prev.includes(channel);
    const next = isOn ? prev.filter((c) => c !== channel) : [...prev, channel];

    // 1) Activate immediately (optimistic slide).
    setOverride(next);
    setPushNote(null);

    // 2) Enabling push needs the browser permission + a SW subscription.
    if (channel === "push" && !isOn) {
      const res = await subscribeToPush();
      if (res !== "ok") {
        setOverride(prev); // deactivate on error
        setPushNote(
          res === "denied"
            ? "Permite notificările din setările browserului/telefonului."
            : res === "unsupported"
              ? "Notificările push nu sunt suportate aici (adaugă pe ecranul principal pe iOS)."
              : "Nu am putut activa notificările push acum.",
        );
        return;
      }
      setPushNote("Notificările push sunt active pe acest dispozitiv.");
    }

    // 3) Persist; revert the slide if the save fails.
    updateMe.mutate(
      { notificationChannels: next },
      {
        onSuccess: () => setOverride(null),
        onError: () => {
          setOverride(prev);
          setPushNote("Nu am putut salva preferința. Reîncearcă.");
        },
      },
    );
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
          <EditableRow
            icon={User}
            label="Nume"
            value={me?.fullName}
            emptyLabel="Adaugă-ți numele"
            loading={isLoading}
            placeholder="Numele complet"
            saving={updateMe.isPending}
            onSave={(fullName) => updateMe.mutate({ fullName })}
          />
          <PRow
            icon={Phone}
            label="Telefon"
            value={isLoading ? <Shimmer className="h-3.5 w-28 rounded" /> : me?.phoneNumber}
            trailing={
              <span className="text-[11px] font-medium text-warm-faint">
                autentificare prin telefon
              </span>
            }
          />
          <EditableRow
            icon={Mail}
            label="Email"
            value={me?.email}
            emptyLabel="Adaugă email"
            loading={isLoading}
            type="email"
            placeholder="nume@exemplu.ro"
            saving={updateMe.isPending}
            validate={(v) => (EMAIL_RE.test(v) ? null : "Introdu o adresă de email validă")}
            onSave={(email) => updateMe.mutate({ email })}
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
          {pushNote && (
            <p className="mt-2 px-1 text-xs font-medium text-warm-muted">{pushNote}</p>
          )}
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
