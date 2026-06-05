"use client";

import type { CreatePnrInput, PnrStatus } from "@aerly/shared";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { addPnr, deletePnr, getPnrs } from "@/lib/api";

export const pnrKeys = {
  all: ["pnrs"] as const,
  list: (status: PnrStatus) => ["pnrs", status] as const,
};

export function usePnrs(status: PnrStatus = "active") {
  return useQuery({
    queryKey: pnrKeys.list(status),
    queryFn: () => getPnrs(status),
  });
}

export function useAddPnr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePnrInput) => addPnr(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: pnrKeys.all }),
  });
}

export function useDeletePnr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePnr(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: pnrKeys.all }),
  });
}
