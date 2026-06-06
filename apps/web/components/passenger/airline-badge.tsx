import { cn } from "@/lib/utils";

/** Brand colours per airline IATA prefix (the schedule's airlineCode). */
const BRANDS: Record<string, { bg: string; fg: string }> = {
  W4: { bg: "#C6007E", fg: "#ffffff" }, // Wizz Air — magenta
  W6: { bg: "#C6007E", fg: "#ffffff" },
  RO: { bg: "#10256B", fg: "#ffffff" }, // TAROM — navy
  OS: { bg: "#CC0000", fg: "#ffffff" }, // Austrian — red
  FR: { bg: "#073590", fg: "#F4D000" }, // Ryanair — navy/yellow
  A2: { bg: "#0E9AA7", fg: "#ffffff" }, // AnimaWings — teal
  H4: { bg: "#1D4ED8", fg: "#ffffff" }, // HiSky — blue
  LH: { bg: "#05164D", fg: "#F9BA00" }, // Lufthansa
  KL: { bg: "#00A1DE", fg: "#ffffff" }, // KLM
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
  const brand = BRANDS[code] ?? { bg: "#C8A24E", fg: "#2B2218" }; // default gold
  return (
    <span
      aria-hidden
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
