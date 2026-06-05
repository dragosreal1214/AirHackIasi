"use client";

import { useQuery } from "@tanstack/react-query";

import { searchFlights } from "@/lib/api";

export function useFlightSearch(query: string, date?: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["flights", "search", trimmed, date ?? null],
    queryFn: () => searchFlights(trimmed, date),
    enabled: trimmed.length >= 2,
  });
}
