"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { getAlternatives, getDisruption, selectAlternative } from "@/lib/api";

export function useDisruption(id: string) {
  return useQuery({
    queryKey: ["disruption", id],
    queryFn: () => getDisruption(id),
    enabled: Boolean(id),
  });
}

export function useAlternatives(disruptionId: string) {
  return useQuery({
    queryKey: ["alternatives", disruptionId],
    queryFn: () => getAlternatives(disruptionId),
    enabled: Boolean(disruptionId),
  });
}

export function useSelectAlternative() {
  return useMutation({
    mutationFn: (alternativeId: string) => selectAlternative(alternativeId),
  });
}
