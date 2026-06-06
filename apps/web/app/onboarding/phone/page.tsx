"use client";

import { ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CButton } from "@/components/ui/button";
import { CLabel } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { CWord } from "@/components/ui/wordmark";
import { ApiClientError, startPhoneVerification } from "@/lib/api";
import { isValidRoMobile, normalizeRoMobile } from "@/lib/phone";

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setError(null);
    if (!isValidRoMobile(phone)) {
      setError("Introdu un număr de mobil valid (ex. 712 345 678).");
      return;
    }
    const e164 = normalizeRoMobile(phone);
    setPending(true);
    try {
      const res = await startPhoneVerification(e164);
      sessionStorage.setItem("aerly_challenge", res.challengeId);
      sessionStorage.setItem("aerly_phone", e164);
      sessionStorage.setItem("aerly_method", res.method);
      router.push("/onboarding/verify");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Ceva n-a mers. Reîncearcă.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="cine-surface flex min-h-screen flex-1 flex-col px-6 pt-safe-top">
      <div className="flex flex-1 flex-col pt-10">
        <div className="animate-c-fade-up" style={{ animationDelay: "40ms" }}>
          <CWord size={36} />
        </div>

        <h1
          className="mt-10 font-display text-[2.75rem] leading-[1.05] tracking-tight text-espresso animate-c-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Cu un <span className="italic text-accent-deep">aer</span> înainte.
        </h1>
        <p
          className="mt-3 text-base leading-relaxed text-warm-muted animate-c-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          Îți trimitem un cod prin SMS ca să-ți confirmăm numărul. Fără parolă.
        </p>

        <div
          className="mt-10 animate-c-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <CLabel htmlFor="phone">Numărul tău de telefon</CLabel>
          <PhoneField
            id="phone"
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="712 345 678"
            containerClassName="mt-2"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>
        )}

        <CButton
          variant="gold"
          size="lg"
          full
          onClick={submit}
          disabled={pending}
          rightIcon={!pending ? <ArrowRight className="h-5 w-5" /> : undefined}
          className="mt-8 animate-c-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          {pending ? "Se trimite…" : "Continuă"}
        </CButton>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-warm-faint">
          <Lock className="h-3.5 w-3.5" />
          Numărul tău e folosit doar pentru alerte de zbor.
        </p>
      </div>
    </div>
  );
}
