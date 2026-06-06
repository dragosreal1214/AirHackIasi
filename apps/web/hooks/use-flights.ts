"use client";

import { useQuery } from "@tanstack/react-query";

import { searchFlights, type FlightSearchParams } from "@/lib/api";

export function useFlightSearch(params: FlightSearchParams) {
  const q = (params.q ?? "").trim();
  const origin = (params.origin ?? "").trim();
  const destination = (params.destination ?? "").trim();
  const enabled = q.length >= 2 || origin.length >= 2 || destination.length >= 2;

  return useQuery({
    queryKey: [
      "flights",
      "search",
      q,
      origin,
      destination,
      params.date ?? null,
      params.time ?? null,
    ],
    queryFn: () =>
      searchFlights({
        q: q || undefined,
        origin: origin || undefined,
        destination: destination || undefined,
        date: params.date,
        time: params.time,
      }),
    enabled,
  });
}
