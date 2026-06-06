"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/** Fallback brand colours per airline IATA (used only if the logo image fails). */
const BRANDS: Record<string, { bg: string; fg: string }> = {
  W4: { bg: "#C6007E", fg: "#ffffff" },
  W6: { bg: "#C6007E", fg: "#ffffff" },
  RO: { bg: "#10256B", fg: "#ffffff" },
  OS: { bg: "#CC0000", fg: "#ffffff" },
  FR: { bg: "#073590", fg: "#F4D000" },
  A2: { bg: "#0E9AA7", fg: "#ffffff" },
  H4: { bg: "#1D4ED8", fg: "#ffffff" },
  LH: { bg: "#05164D", fg: "#F9BA00" },
  KL: { bg: "#00A1DE", fg: "#ffffff" },
};

/** Map our schedule codes to the airline's logo IATA where they differ. */
const LOGO_IATA: Record<string, string> = {
  W4: "W6", // Wizz Air
};

export function AirlineBadge({
  code,
  size = 36,
  className,
}: {
  code: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const brand = BRANDS[code] ?? { bg: "#C8A24E", fg: "#2B2218" };
  const logoIata = LOGO_IATA[code] ?? code;

  if (!failed) {
    return (
      <span
        className={cn(
          "inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/[0.06]",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {/* Real airline logo (Kiwi.com CDN); falls back to the code badge on error. */}
        <img
          src={`https://images.kiwi.com/airlines/128/${logoIata}.png`}
          alt={code}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
          style={{ padding: Math.max(2, Math.round(size * 0.14)) }}
        />
      </span>
    );
  }

  return (
    <span
      aria-label={code}
      role="img"
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center rounded-full font-bold tracking-tight ring-1 ring-black/[0.06]",
        className,
      )}
      style={{
        background: brand.bg,
        color: brand.fg,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
      }}
    >
      {code}
    </span>
  );
}
