"use client";

import { ArrowRight, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="flex flex-1 flex-col px-6 pt-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Plane className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        Cu un <span className="text-primary">aer</span> înainte.
      </h1>
      <p className="mt-2 text-slate-500">
        Îți trimitem un cod prin SMS ca să-ți confirmăm numărul. Fără parolă.
      </p>

      <label className="mt-10 block text-sm font-medium text-slate-700">
        Numărul tău de telefon
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <span className="text-sm font-medium text-slate-500">🇷🇴 +40</span>
        <input
          autoFocus
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="7xx xxx xxx"
          className="w-full bg-transparent py-3 text-sm outline-none"
        />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-8 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Se trimite…" : "Continuă"}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-4 text-center text-xs text-slate-400">
        Numărul tău e folosit doar pentru alerte de zbor.
      </p>
    </div>
  );
}
