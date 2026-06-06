"use client";

import { useQuery } from "@tanstack/react-query";

import { getFlightDetail } from "@/lib/api";

export function useFlightDetail(flightId: string) {
  return useQuery({
    queryKey: ["flight-detail", flightId],
    queryFn: () => getFlightDetail(flightId),
    enabled: Boolean(flightId),
  });
}
