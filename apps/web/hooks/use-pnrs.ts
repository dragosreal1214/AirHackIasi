"use client";

import type { CreatePnrInput, PnrStatus, PnrWithFlight } from "@aerly/shared";
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
    // Optimistic: drop the flight from every cached list immediately.
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: pnrKeys.all });
      const prev = qc.getQueriesData<PnrWithFlight[]>({ queryKey: pnrKeys.all });
      qc.setQueriesData<PnrWithFlight[]>({ queryKey: pnrKeys.all }, (old) =>
        old ? old.filter((p) => p.id !== id) : old,
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: pnrKeys.all }),
  });
}
