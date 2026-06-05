"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ApiClientError, verifyOtp } from "@/lib/api";
import { setTokens } from "@/lib/auth";

function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  return `${phone.slice(0, 5)} ••• ${phone.slice(-3)}`;
}

export default function VerifyPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    const ch = sessionStorage.getItem("aerly_challenge");
    if (!ch) {
      router.replace("/onboarding/phone");
      return;
    }
    setChallengeId(ch);
    setPhone(sessionStorage.getItem("aerly_phone") ?? "");
    setIsDev(sessionStorage.getItem("aerly_method") === "dev");
    inputRef.current?.focus();
  }, [router]);

  async function submit(value: string) {
    if (!challengeId || value.length !== 6) return;
    setError(null);
    setPending(true);
    try {
      const tokens = await verifyOtp(challengeId, value);
      setTokens(tokens.accessToken, tokens.refreshToken);
      sessionStorage.removeItem("aerly_challenge");
      router.replace("/");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Cod greșit. Mai încearcă.");
      setCode("");
      setPending(false);
    }
  }

  function onChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) void submit(digits);
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-6">
      <Link
        href="/onboarding/phone"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
        aria-label="Înapoi"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <h1 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
        Verifică numărul
      </h1>
      <p className="mt-2 text-slate-500">
        Am trimis un cod de 6 cifre la{" "}
        <span className="font-medium text-slate-700">{maskPhone(phone)}</span>.
      </p>

      <input
        ref={inputRef}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        disabled={pending}
        placeholder="••••••"
        className="mt-8 w-full rounded-xl border border-slate-200 bg-white py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      />

      {error && <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>}
      {pending && <p className="mt-3 text-sm text-slate-400">Se verifică…</p>}

      {isDev && (
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Mod demo (fără SMS real): folosește codul <b>000000</b>.
        </p>
      )}
    </div>
  );
}
