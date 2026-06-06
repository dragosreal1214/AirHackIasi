import type { AlternativeType, RiskLevel } from "@aerly/shared";

const TZ = "Europe/Bucharest";

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatCost(eur: number): string {
  if (eur <= 0) return "Gratuit";
  return `${Math.round(eur)} €`;
}

export interface RiskMeta {
  label: string;
  /** Tailwind text color class. */
  text: string;
  /** Tailwind background tint class. */
  bg: string;
  /** Tailwind solid background (for meters/dots). */
  solid: string;
  border: string;
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  low: {
    label: "Risc scăzut",
    text: "text-risk-low",
    bg: "bg-risk-low/[0.13]",
    solid: "bg-risk-low",
    border: "border-risk-low/25",
  },
  moderate: {
    label: "Risc moderat",
    text: "text-accent-deep",
    bg: "bg-risk-moderate/[0.15]",
    solid: "bg-risk-moderate",
    border: "border-risk-moderate/30",
  },
  high: {
    label: "Risc ridicat",
    text: "text-risk-high",
    bg: "bg-risk-high/[0.13]",
    solid: "bg-risk-high",
    border: "border-risk-high/25",
  },
  critical: {
    label: "Risc critic",
    text: "text-risk-critical",
    bg: "bg-risk-critical/[0.13]",
    solid: "bg-risk-critical",
    border: "border-risk-critical/25",
  },
};

export interface AlternativeMeta {
  label: string;
  emoji: string;
  /** Tailwind classes for the icon chip. */
  chip: string;
}

export const ALTERNATIVE_META: Record<AlternativeType, AlternativeMeta> = {
  train: { label: "Tren", emoji: "🚆", chip: "bg-sky/20 text-sky-ink" },
  alternate_flight: {
    label: "Alt zbor",
    emoji: "✈️",
    chip: "bg-accent/[0.15] text-accent-deep",
  },
  reroute_airport: {
    label: "Reroute",
    emoji: "🛫",
    chip: "bg-sky-deep/15 text-sky-ink",
  },
  bus: { label: "Autocar", emoji: "🚌", chip: "bg-accent-soft/25 text-accent-deep" },
};

export function riskPercent(probability: number): number {
  return Math.round(probability * 100);
}
