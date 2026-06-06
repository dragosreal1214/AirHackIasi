"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { CRing } from "@/components/ui/success-ring";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 1900);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center px-9 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgb(var(--color-sky) / 0.35) 0%, rgb(var(--color-ivory)) 50%, rgb(var(--color-cream)) 100%)",
      }}
    >
      <div
        className="rounded-full border border-accent/30 bg-white/50 p-5 animate-c-scale-in"
        style={{ boxShadow: "0 0 0 8px rgba(200,162,78,0.07), 0 8px 24px rgba(33,24,14,0.08)" }}
      >
        <CRing size={112} />
      </div>
      <h1
        className="mt-7 font-display text-3xl leading-tight tracking-tight text-espresso animate-c-fade-up"
        style={{ animationDelay: "260ms" }}
      >
        Gata, ești înăuntru.
      </h1>
      <p
        className="mt-3 text-warm-muted animate-c-fade-up"
        style={{ animationDelay: "340ms" }}
      >
        Bine ai venit la Aerly. Te ducem înăuntru…
      </p>
    </div>
  );
}
