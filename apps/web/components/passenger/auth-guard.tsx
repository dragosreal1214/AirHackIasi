"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { isAuthenticated } from "@/lib/auth";

/** Redirects to onboarding when no token is present. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/onboarding/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Se încarcă…
      </div>
    );
  }
  return <>{children}</>;
}
