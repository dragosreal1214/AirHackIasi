"use client";

import { useMemo, useState } from "react";
import { MapPin, Star } from "lucide-react";

import { AppBar } from "@/components/passenger/app-bar";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { cn } from "@/lib/utils";

/** Static hotel data — partner hotels near Iași airport (LRIA) for overnight disruptions. */
interface Hotel {
  id: string;
  name: string;
  /** Distance from LRIA in km. */
  distanceKm: number;
  /** Price per night in EUR. */
  pricePerNight: number;
  /** Rating out of 5. */
  rating: number;
  /** Number of reviews. */
  reviews: number;
  /** Short Romanian descriptor. */
  blurb: string;
  /** Tailwind gradient classes for the placeholder image. */
  gradient: string;
  /** Booking URL. */
  bookingUrl: string;
}

const HOTELS: Hotel[] = [
  {
    id: "international",
    name: "Hotel International Iași",
    distanceKm: 7.4,
    pricePerNight: 89,
    rating: 4.6,
    reviews: 1284,
    blurb: "5 stele în centru · spa și transfer gratuit",
    gradient: "from-[#c8a24e] via-[#e8c97a] to-[#b8924e]",
    bookingUrl: "https://www.booking.com/hotel/ro/international-iasi.ro.html",
  },
  {
    id: "unirea",
    name: "Grand Hotel Unirea",
    distanceKm: 8.1,
    pricePerNight: 76,
    rating: 4.4,
    reviews: 942,
    blurb: "Vedere panoramică · restaurant la etaj 13",
    gradient: "from-[#5b8fa8] via-[#7ab5cc] to-[#3d7090]",
    bookingUrl: "https://www.booking.com/hotel/ro/grand-unirea-iasi.ro.html",
  },
  {
    id: "select",
    name: "Hotel Select",
    distanceKm: 6.2,
    pricePerNight: 64,
    rating: 4.3,
    reviews: 671,
    blurb: "Aproape de aeroport · mic dejun inclus",
    gradient: "from-[#7c6f5a] via-[#a8987c] to-[#6a5e48]",
    bookingUrl: "https://www.booking.com/hotel/ro/select-iasi.ro.html",
  },
  {
    id: "pleiada",
    name: "Hotel Pleiada Boutique",
    distanceKm: 9.8,
    pricePerNight: 112,
    rating: 4.8,
    reviews: 528,
    blurb: "Boutique de lux · piscină interioară",
    gradient: "from-[#8b6b8a] via-[#b090ae] to-[#6e5070]",
    bookingUrl: "https://www.booking.com/hotel/ro/pleiada-iasi.ro.html",
  },
  {
    id: "moldova",
    name: "Hotel Moldova",
    distanceKm: 8.6,
    pricePerNight: 58,
    rating: 4.1,
    reviews: 803,
    blurb: "Clasic și confortabil · parcare gratuită",
    gradient: "from-[#5a7a5a] via-[#82a882] to-[#3e5e3e]",
    bookingUrl: "https://www.booking.com/hotel/ro/moldova-iasi.ro.html",
  },
  {
    id: "ramada",
    name: "Ramada by Wyndham Iași",
    distanceKm: 5.1,
    pricePerNight: 95,
    rating: 4.5,
    reviews: 1097,
    blurb: "Cel mai aproape de LRIA · check-in 24/7",
    gradient: "from-[#c8a24e] via-[#e8c97a] to-[#b8924e]",
    bookingUrl: "https://www.booking.com/hotel/ro/ramada-iasi.ro.html",
  },
];

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
            <GoldCard
              key={hotel.id}
              elevated
              className="animate-c-fade-up overflow-hidden p-0"
              style={{ animationDelay: `${160 + i * 70}ms` }}
            >
              {/* Gradient placeholder image */}
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
                      <StarRating rating={hotel.rating} reviews={hotel.reviews} />
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

                <a
                  href={hotel.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block transition-transform duration-120 ease-cinematic active:scale-[0.98]"
                >
                  <CButton variant="gold" full>
                    Rezervă
                  </CButton>
                </a>
              </div>
            </GoldCard>
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
