"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ApiClientError, verifyOtp } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { OtpInput } from "@/components/ui/otp-input";
import { CRing } from "@/components/ui/success-ring";

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
  const [success, setSuccess] = useState(false);

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
      setSuccess(true);
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

  if (success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center animate-fade-up">
        <CRing size={120} />
        <h1 className="mt-8 font-display text-3xl tracking-tight text-espresso">
          Gata, ești înăuntru.
        </h1>
        <p className="mt-2 text-warm-muted">Te ducem la zborurile tale…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-safe-top animate-fade-up">
      <div className="pt-6">
        <Link
          href="/onboarding/phone"
          aria-label="Înapoi"
          className="-ml-1 flex h-[34px] w-[34px] items-center justify-center rounded-icon border border-[color:var(--gold-border)] bg-white/60 text-espresso backdrop-blur-glass transition-all duration-120 ease-cinematic active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <h1 className="mt-8 font-display text-3xl tracking-tight text-espresso">
        Verifică numărul
      </h1>
      <p className="mt-2 text-warm-muted">
        Am trimis un cod de 6 cifre la{" "}
        <span className="font-semibold text-espresso">{maskPhone(phone)}</span>.
      </p>

      <OtpInput
        value={code}
        onChange={onChange}
        disabled={pending}
        className="mt-10"
      />

      {error && (
        <p className="mt-4 text-sm font-semibold text-risk-high">{error}</p>
      )}
      {pending && !error && (
        <p className="mt-4 text-sm text-warm-muted">Se verifică…</p>
      )}

      <p className="mt-6 text-sm text-warm-muted">
        N-ai primit codul?{" "}
        <Link
          href="/onboarding/phone"
          className="font-semibold text-accent-deep underline-offset-2 hover:underline"
        >
          Trimite din nou
        </Link>
      </p>

      {isDev && (
        <p className="mt-8 rounded-card border border-[color:var(--gold-border)] bg-accent-soft/15 px-4 py-3 text-xs text-accent-deep">
          Mod demo (fără SMS real): folosește codul <b>000000</b>.
        </p>
      )}
    </div>
  );
}
