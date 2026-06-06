"use client";

import type { UpdateMeInput } from "@aerly/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMe, updateMe } from "@/lib/api";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: getMe });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeInput) => updateMe(input),
    onSuccess: (me) => qc.setQueryData(["me"], me),
  });
}
