"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CButton } from "@/components/ui/button";
import { CLabel } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { CWord } from "@/components/ui/wordmark";
import { ApiClientError, startPhoneVerification } from "@/lib/api";

const RO_MOBILE = /^(\+40|0)7\d{8}$/;

function normalize(input: string): string {
  const digits = input.replace(/\s+/g, "");
  if (digits.startsWith("0")) return "+40" + digits.slice(1);
  if (digits.startsWith("7")) return "+40" + digits;
  return digits;
}

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setError(null);
    const value = phone.replace(/\s+/g, "");
    if (!RO_MOBILE.test(value)) {
      setError("Introdu un număr de mobil valid (07xx xxx xxx).");
      return;
    }
    const e164 = normalize(value);
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
    <div className="flex flex-1 flex-col px-6 pt-safe-top">
      <div className="flex flex-1 flex-col pt-12 animate-fade-up">
        <CWord size={40} />

        <h1 className="mt-10 font-display text-[2.75rem] leading-[1.05] tracking-tight text-espresso">
          Cu un <span className="text-accent-deep">aer</span> înainte.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-warm-muted">
          Îți trimitem un cod prin SMS ca să-ți confirmăm numărul. Fără parolă.
        </p>

        <div className="mt-10">
          <CLabel htmlFor="phone">Numărul tău de telefon</CLabel>
          <PhoneField
            id="phone"
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="7xx xxx xxx"
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
          className="mt-8"
        >
          {pending ? "Se trimite…" : "Continuă"}
        </CButton>

        <p className="mt-4 text-center text-xs text-warm-faint">
          Numărul tău e folosit doar pentru alerte de zbor.
        </p>
      </div>
    </div>
  );
}
