"use client";

import { Banknote, Plane, Scale, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { GoldCard } from "@/components/ui/card";
import { CLabel } from "@/components/ui/label";
import { GoldDivider } from "@/components/ui/divider";
import { FilterChips } from "@/components/ui/filter-chips";
import { cn } from "@/lib/utils";

type DistanceBand = "sub1500" | "mid" | "over3500";
type Cause = "intarziere" | "anulare" | "refuz" | "extraordinar";

const DISTANCE_OPTIONS: { value: DistanceBand; label: string }[] = [
  { value: "sub1500", label: "Sub 1500 km" },
  { value: "mid", label: "1500–3500 km" },
  { value: "over3500", label: "Peste 3500 km" },
];

const CAUSE_OPTIONS: { value: Cause; label: string }[] = [
  { value: "intarziere", label: "Întârziere 3h+" },
  { value: "anulare", label: "Anulare" },
  { value: "refuz", label: "Refuz îmbarcare" },
  { value: "extraordinar", label: "Circumstanțe extraordinare" },
];

// Câteva rute cunoscute operate din LRIA (Iași) cu distanța aproximativă.
const KNOWN_ROUTES: {
  value: string;
  label: string;
  route: string;
  km: number;
  band: DistanceBand;
}[] = [
  { value: "ias-otp", label: "IAS → OTP", route: "Iași → București", km: 310, band: "sub1500" },
  { value: "ias-vie", label: "IAS → VIE", route: "Iași → Viena", km: 1080, band: "sub1500" },
  { value: "ias-bcn", label: "IAS → BCN", route: "Iași → Barcelona", km: 2150, band: "mid" },
  { value: "ias-lon", label: "IAS → LTN", route: "Iași → Londra", km: 2240, band: "mid" },
  { value: "ias-bru", label: "IAS → BRU", route: "Iași → Bruxelles", km: 1880, band: "mid" },
  { value: "ias-tlv", label: "IAS → TLV", route: "Iași → Tel Aviv", km: 1620, band: "mid" },
];

const BAND_AMOUNT: Record<DistanceBand, number> = {
  sub1500: 250,
  mid: 400,
  over3500: 600,
};

const BAND_BASIS: Record<DistanceBand, string> = {
  sub1500: "Art. 7(1)(a) — zboruri de până la 1500 km.",
  mid: "Art. 7(1)(b) — zboruri intra-UE de peste 1500 km și toate celelalte între 1500 și 3500 km.",
  over3500: "Art. 7(1)(c) — toate celelalte zboruri de peste 3500 km.",
};

export default function CompensationPage() {
  const [band, setBand] = useState<DistanceBand>("mid");
  const [cause, setCause] = useState<Cause>("intarziere");
  const [routeValue, setRouteValue] = useState<string>("");

  // Calcul EU261 — pură logică client, fără backend.
  const result = useMemo(() => {
    const baseAmount = BAND_AMOUNT[band];
    const eligible = cause !== "extraordinar";
    return {
      amount: eligible ? baseAmount : 0,
      baseAmount,
      eligible,
    };
  }, [band, cause]);

  const selectedRoute = KNOWN_ROUTES.find((r) => r.value === routeValue);

  function handlePickRoute(value: string) {
    const next = value === routeValue ? "" : value;
    setRouteValue(next);
    const picked = KNOWN_ROUTES.find((r) => r.value === next);
    if (picked) setBand(picked.band);
  }

  return (
    <>
      <AppBar title="Compensație" backHref="/" />

      <div className="animate-fade-up px-4 py-5">
        {/* Intro */}
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border-strong)] bg-accent/[0.12] text-accent-deep shadow-glass">
            <Scale className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl leading-tight tracking-tight text-espresso">
              Calculator EU261
            </h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-warm-muted">
              Estimează compensația la care ai dreptul în baza Regulamentului (CE)
              nr. 261/2004.
            </p>
          </div>
        </div>

        {/* Distance band */}
        <div className="space-y-2">
          <CLabel className="px-1">Distanța zborului</CLabel>
          <FilterChips
            options={DISTANCE_OPTIONS}
            value={band}
            onChange={(value) => {
              setBand(value);
              setRouteValue("");
            }}
          />
        </div>

        {/* Known routes */}
        <div className="mt-5 space-y-2">
          <CLabel className="px-1">Sau alege o rută din Iași (LRIA)</CLabel>
          <div className="grid grid-cols-2 gap-2">
            {KNOWN_ROUTES.map((r) => {
              const active = r.value === routeValue;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handlePickRoute(r.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-start rounded-input border px-3 py-2.5 text-left transition-all duration-150 ease-cinematic active:scale-[0.98]",
                    active
                      ? "border-[var(--gold-border-strong)] bg-accent/[0.15] shadow-glass"
                      : "border-[color:var(--gold-border)] bg-white/60 backdrop-blur-glass",
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold text-espresso">
                    <Plane
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        active ? "text-accent-deep" : "text-warm-muted",
                      )}
                    />
                    {r.label}
                  </span>
                  <span className="mt-0.5 truncate text-xs font-medium text-warm-muted">
                    {r.route} · ~{r.km} km
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cause */}
        <div className="mt-5 space-y-2">
          <CLabel className="px-1">Cauza perturbării</CLabel>
          <FilterChips options={CAUSE_OPTIONS} value={cause} onChange={setCause} />
        </div>

        {/* Result */}
        <GoldCard elevated className="mt-6 animate-scale-in p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-deep/70">
            <Sparkles className="h-3.5 w-3.5" />
            Estimare compensație
          </div>

          {result.eligible ? (
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-5xl leading-none tracking-tight text-espresso">
                {result.amount}€
              </span>
              <span className="pb-1 text-sm font-semibold text-warm-muted">
                / pasager
              </span>
            </div>
          ) : (
            <div className="mt-3">
              <span className="font-display text-3xl leading-none tracking-tight text-espresso">
                Fără compensație
              </span>
              <p className="mt-2 text-sm font-medium leading-relaxed text-warm-muted">
                În circumstanțe extraordinare (ex. condiții meteo extreme, greve,
                riscuri de securitate) operatorul aerian este exonerat de plata
                compensației, conform art. 5(3).
              </p>
            </div>
          )}

          {selectedRoute && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-accent-deep">
              <Plane className="h-3.5 w-3.5" />
              {selectedRoute.route} · ~{selectedRoute.km} km
            </div>
          )}

          <GoldDivider className="my-4" />

          <div className="flex items-start gap-2.5">
            <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-warm-muted">
                Temei legal
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-warm-ink">
                {result.eligible
                  ? BAND_BASIS[band]
                  : "Art. 5(3) — operatorul nu datorează compensație dacă perturbarea se datorează unor circumstanțe extraordinare care nu au putut fi evitate."}
              </p>
              {result.eligible && cause === "intarziere" && (
                <p className="mt-2 text-xs font-medium leading-relaxed text-warm-muted">
                  Conform hotărârii CJUE în cauzele Sturgeon și Nelson, întârzierea
                  la sosire de cel puțin 3 ore dă dreptul la aceeași compensație ca
                  o anulare.
                </p>
              )}
            </div>
          </div>
        </GoldCard>

        <p className="mt-4 px-1 text-xs font-medium leading-relaxed text-warm-muted">
          Estimare orientativă. Suma poate fi redusă cu 50% dacă ți se oferă o
          redirecționare cu o întârziere limitată (art. 7(2)). Aceasta nu
          constituie consultanță juridică.
        </p>
      </div>
    </>
  );
}
