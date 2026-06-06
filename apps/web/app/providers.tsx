"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // data stays "fresh" 1 min → no refetch/skeleton on re-nav
            gcTime: 10 * 60_000, // keep cached results 10 min for instant back/forward
            refetchOnWindowFocus: false,
            refetchOnMount: false, // don't refetch if cache is still fresh
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
