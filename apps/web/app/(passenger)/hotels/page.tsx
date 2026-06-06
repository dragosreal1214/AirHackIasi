"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import { AppBar } from "@/components/passenger/app-bar";
import { GoldCard } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { cn } from "@/lib/utils";
import { HOTELS } from "./hotels-data";

type SortKey = "price" | "distance";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price", label: "Preț" },
  { value: "distance", label: "Distanță" },
];

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
      <span className="text-xs font-bold tracking-tight text-espresso">
        {rating.toFixed(1)}
      </span>
      <span className="text-xs font-medium text-warm-muted">
        ({reviews.toLocaleString("ro-RO")})
      </span>
    </span>
  );
}

export default function HotelsPage() {
  const [sort, setSort] = useState<SortKey>("distance");

  const hotels = useMemo(() => {
    const list = [...HOTELS];
    list.sort((a, b) =>
      sort === "price"
        ? a.pricePerNight - b.pricePerNight
        : a.distanceKm - b.distanceKm,
    );
    return list;
  }, [sort]);

  return (
    <>
      <AppBar title="Cazare" backHref="/" />
      <div className="px-4 py-5">
        <h1 className="animate-c-fade-up font-display text-3xl leading-tight tracking-tight text-espresso">
          Hoteluri partenere
        </h1>
        <p
          className="mt-1.5 max-w-sm animate-c-fade-up text-sm font-medium leading-relaxed text-warm-muted"
          style={{ animationDelay: "60ms" }}
        >
          Cazare peste noapte lângă Aeroportul Iași (LRIA) dacă zborul tău este
          anulat sau reprogramat. Tarife negociate pentru pasageri Fogora.
        </p>

        <div
          className="-mx-4 mt-5 animate-c-fade-up px-4"
          style={{ animationDelay: "120ms" }}
        >
          <FilterChips options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>

        <div className="mt-5 space-y-4">
          {hotels.map((hotel, i) => (
            <Link
              key={hotel.id}
              href={`/hotels/${hotel.id}`}
              className="block animate-c-fade-up"
              style={{ animationDelay: `${160 + i * 70}ms` }}
            >
              <GoldCard
                elevated
                interactive
                className="overflow-hidden p-0"
              >
                {/* Hero image with gradient fallback */}
                <div
                  className={cn(
                    "relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br",
                    hotel.gradient,
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-6 -top-8 h-28 w-28 rounded-full bg-white/[0.07]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-10 right-2 h-32 w-32 rounded-full bg-white/[0.05]"
                  />
                  <span className="select-none font-display text-6xl tracking-tighter text-white/35">
                    {hotel.name.charAt(0)}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                  />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/20 px-2.5 py-1 text-xs font-bold tracking-tight text-white backdrop-blur-lg">
                    <MapPin className="h-3 w-3" strokeWidth={2.4} />
                    {hotel.distanceKm.toFixed(1)} km
                  </span>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold leading-tight tracking-tight text-espresso">
                        {hotel.name}
                      </h2>
                      <div className="mt-1.5">
                        <StarRating
                          rating={hotel.rating}
                          reviews={hotel.reviews}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-display text-2xl leading-none text-accent-deep">
                        €{hotel.pricePerNight}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-warm-muted">
                        / noapte
                      </p>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs font-medium leading-relaxed text-warm-muted">
                    {hotel.blurb}
                  </p>
                </div>
              </GoldCard>
            </Link>
          ))}
        </div>

        <p className="mt-6 px-1 text-center text-[11px] font-medium leading-relaxed text-warm-faint">
          Tarifele sunt orientative și pot varia. Rezervarea se face direct la
          hotel sau prin partenerul afișat.
        </p>
      </div>
    </>
  );
}
