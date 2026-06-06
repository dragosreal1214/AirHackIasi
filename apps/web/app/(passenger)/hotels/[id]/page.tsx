"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Check, MapPin, Phone, Star } from "lucide-react";

import { AppBar } from "@/components/passenger/app-bar";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/divider";
import { cn } from "@/lib/utils";
import { getHotel } from "../hotels-data";

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const hotel = getHotel(id);

  if (!hotel) {
    notFound();
  }

  return (
    <>
      <AppBar title={hotel.name} backHref="/hotels" />

      <div className="pb-safe-bottom">
        {/* Large gradient hero */}
        <div
          className={cn(
            "relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br",
            hotel.gradient,
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-12 h-44 w-44 rounded-full bg-white/[0.08]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-white/[0.06]"
          />
          <span className="select-none font-display text-[7rem] leading-none tracking-tighter text-white/35">
            {hotel.name.charAt(0)}
          </span>
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-xs font-bold tracking-tight text-white backdrop-blur-lg">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} />
            {hotel.distanceKm.toFixed(1)} km de LRIA
          </span>
        </div>

        <div className="px-4 py-5">
          {/* Name + rating + price */}
          <div className="animate-c-fade-up">
            <h1 className="font-display text-3xl leading-tight tracking-tight text-espresso">
              {hotel.name}
            </h1>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5">
                <Star
                  className="h-4 w-4 fill-accent text-accent"
                  strokeWidth={0}
                />
                <span className="text-sm font-bold tracking-tight text-espresso">
                  {hotel.rating.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-warm-muted">
                  ({hotel.reviews.toLocaleString("ro-RO")} recenzii)
                </span>
              </span>
              <span className="flex-shrink-0 text-right">
                <span className="font-display text-3xl leading-none text-accent-deep">
                  €{hotel.pricePerNight}
                </span>
                <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-warm-muted">
                  / noapte
                </span>
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            className="mt-4 animate-c-fade-up text-sm font-medium leading-relaxed text-warm-muted"
            style={{ animationDelay: "60ms" }}
          >
            {hotel.description}
          </p>

          <GoldDivider
            className="my-5 animate-c-fade-up"
            style={{ animationDelay: "120ms" }}
          />

          {/* Amenities */}
          <div
            className="animate-c-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-warm-muted">
              Facilități
            </h2>
            <GoldCard className="mt-3 p-4">
              <ul className="grid grid-cols-1 gap-3">
                {hotel.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2.5 text-sm font-medium text-espresso"
                  >
                    <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft/60 text-accent-deep">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </GoldCard>
          </div>

          {/* Actions */}
          <div
            className="mt-6 animate-c-fade-up space-y-3"
            style={{ animationDelay: "220ms" }}
          >
            <a
              href={hotel.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform duration-120 ease-cinematic active:scale-[0.98]"
            >
              <CButton variant="gold" full>
                Rezervă
              </CButton>
            </a>
            <a
              href={`tel:${hotel.phone}`}
              className="flex items-center justify-center gap-2 rounded-button py-2.5 text-sm font-semibold tracking-tight text-accent-deep transition-transform duration-120 ease-cinematic active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" strokeWidth={2.2} />
              Sună hotelul
            </a>
          </div>

          <p className="mt-5 px-1 text-center text-[11px] font-medium leading-relaxed text-warm-faint">
            Tarifele sunt orientative și pot varia. Rezervarea se face direct la
            hotel sau prin partenerul afișat.
          </p>
        </div>
      </div>
    </>
  );
}
