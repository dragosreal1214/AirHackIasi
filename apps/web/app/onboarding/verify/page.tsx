"use client";

import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ApiClientError, verifyOtp } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { OtpInput } from "@/components/ui/otp-input";

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
  const [backHref, setBackHref] = useState("/onboarding/phone");

  useEffect(() => {
    const ch = sessionStorage.getItem("aerly_challenge");
    if (!ch) {
      router.replace("/onboarding/phone");
      return;
    }
    setChallengeId(ch);
    setPhone(sessionStorage.getItem("aerly_phone") ?? "");
    setIsDev(sessionStorage.getItem("aerly_method") === "dev");
    setBackHref(
      sessionStorage.getItem("aerly_flow") === "register"
        ? "/onboarding/register"
        : "/onboarding/phone",
    );
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
      sessionStorage.removeItem("aerly_flow");
      // After the code is verified, always show the success screen (tick draw).
      router.replace("/onboarding/success");
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
    <div className="cine-surface flex min-h-screen flex-1 flex-col px-6 pt-safe-top lg:min-h-0">
      <div className="pt-6 animate-c-fade-up">
        <Link
          href={backHref}
          aria-label="Înapoi"
          className="-ml-1 flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[rgba(200,167,97,0.65)] bg-white/60 text-warm-ink shadow-[0_0_12px_rgba(200,167,97,0.16)] backdrop-blur-lg transition-all duration-120 ease-cinematic active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <h1
        className="mt-8 font-display text-3xl leading-tight tracking-tight text-espresso animate-c-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        Verifică numărul
      </h1>
      <p
        className="mt-2.5 text-[15px] leading-relaxed text-warm-muted animate-c-fade-up"
        style={{ animationDelay: "120ms" }}
      >
        Am trimis un cod de 6 cifre la
        <br />
        <span className="font-semibold tracking-wide text-espresso">
          {maskPhone(phone)}
        </span>
        .
      </p>

      {/* OTP container with premium gold border + staggered cell entrance */}
      <div
        className="mt-8 rounded-[18px] border border-accent/25 bg-white/55 p-5 backdrop-blur-lg animate-c-fade-up [&_input:nth-child(1)]:[animation-delay:200ms] [&_input:nth-child(2)]:[animation-delay:260ms] [&_input:nth-child(3)]:[animation-delay:320ms] [&_input:nth-child(4)]:[animation-delay:380ms] [&_input:nth-child(5)]:[animation-delay:440ms] [&_input:nth-child(6)]:[animation-delay:500ms] [&_input]:animate-c-scale-in"
        style={{
          animationDelay: "180ms",
          boxShadow:
            "0 4px 16px rgba(33,24,14,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <OtpInput value={code} onChange={onChange} disabled={pending} />
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-risk-high">{error}</p>
      )}
      {pending && !error && (
        <p className="mt-4 text-sm text-warm-muted">Se verifică…</p>
      )}

      <div
        className="mt-6 flex items-center gap-1.5 text-sm text-warm-muted animate-c-fade-up"
        style={{ animationDelay: "260ms" }}
      >
        <Clock className="h-4 w-4 text-warm-faint" />
        N-ai primit codul?{" "}
        <Link
          href={backHref}
          className="font-semibold text-accent-deep underline-offset-2 hover:underline"
        >
          Trimite din nou
        </Link>
      </div>

      {isDev && (
        <p className="mt-8 rounded-card border border-[color:var(--gold-border)] bg-accent-soft/15 px-4 py-3 text-xs text-accent-deep">
          Mod demo (fără SMS real): folosește codul <b>000000</b>.
        </p>
      )}
    </div>
  );
}
