"use client";

import { useQuery } from "@tanstack/react-query";

import { getAirportRiskBoard } from "@/lib/api";

export function useAirportRiskBoard(
  iata: string,
  date: string | undefined,
  direction: "departures" | "arrivals" | "all",
) {
  return useQuery({
    queryKey: ["airport-board", iata, date ?? "today", direction],
    queryFn: () => getAirportRiskBoard(iata, { date, direction }),
    enabled: Boolean(iata),
  });
}
