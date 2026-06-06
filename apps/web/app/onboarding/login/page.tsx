"use client";

import { ArrowRight, Lock, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CButton } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ApiClientError, loginEmail } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const continueAsGuest = () => {
    window.localStorage.setItem("fogora_guest", "1");
    router.replace("/");
  };

  async function submit() {
    setError(null);
    if (!EMAIL.test(email)) return setError("Introdu un email valid.");
    if (!pw) return setError("Introdu parola.");
    setPending(true);
    try {
      const tokens = await loginEmail({ email: email.trim(), password: pw });
      setTokens(tokens.accessToken, tokens.refreshToken);
      router.replace("/");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Autentificare eșuată.");
      setPending(false);
    }
  }

  return (
    <div className="cine-surface flex min-h-[100dvh] flex-col bg-espresso lg:min-h-0 lg:bg-transparent">
      {/* Compact hero banner — mobile only (desktop shows the layout's left panel) */}
      <div className="relative h-[34dvh] min-h-[220px] flex-shrink-0 overflow-hidden lg:hidden">
        <img
          src="/cine/login-plane-window.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[50%_42%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,12,7,0.5) 0%, rgba(18,12,7,0.12) 42%, rgba(20,14,8,0.78) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 flex flex-col items-center px-8 pt-[calc(theme(spacing.safe-top)+16px)] text-center">
          <img
            src="/cine/fogora-mark-256.png"
            alt="Fogora"
            className="h-[60px] w-[60px] object-contain drop-shadow-[0_6px_26px_rgba(0,0,0,0.55)]"
          />
          <h1 className="mt-3 font-display text-[1.7rem] leading-[1.1] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
            Cu un pas <span className="italic text-sky">înaintea ceții.</span>
          </h1>
        </div>
      </div>

      {/* Login card — visible without scrolling */}
      <div className="relative z-[2] -mt-5 flex-1 px-3.5 pb-safe-bottom lg:mt-0 lg:px-0 lg:pb-0">
        <div
          className={cn(
            "rounded-[28px_28px_22px_22px] border border-accent/40 bg-ivory/95 px-6 pb-6 pt-2.5 backdrop-blur-xl",
            "shadow-[0_-10px_40px_rgba(20,14,8,0.34),inset_0_1px_0_rgba(255,255,255,0.8)]",
          )}
        >
          <div className="mx-auto mb-4 h-[5px] w-11 rounded-full bg-accent/25 lg:hidden" />

          <h2 className="font-display text-3xl leading-tight tracking-tight text-espresso">
            Verifică un zbor.
          </h2>
          <p className="mt-1 text-sm text-warm-muted">
            Intri direct, fără cont — vezi statusul și riscul de perturbare.
          </p>

          {/* PRIMARY: continue as guest, no account */}
          <CButton
            variant="gold"
            size="lg"
            full
            onClick={continueAsGuest}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="mt-4"
          >
            Verifică un zbor — fără cont
          </CButton>

          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[12px] text-warm-faint">
            <Lock className="h-3.5 w-3.5" />
            Cont necesar doar pentru alerte în timp real.
          </p>

          <div
            className="my-4 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(200,162,78,0.22) 30%, rgba(200,162,78,0.22) 70%, transparent)",
            }}
          />

          {/* Login — phone number is the primary method */}
          <Link
            href="/onboarding/phone"
            className="inline-flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-button border border-[rgba(200,167,97,0.65)] bg-ivory/95 px-7 text-base font-semibold tracking-tight text-espresso shadow-ivory-button transition-all duration-150 ease-cinematic active:scale-[0.98]"
          >
            <Smartphone className="h-5 w-5" />
            Intră cu numărul de telefon
          </Link>

          {/* alternative: email + password */}
          <div className="my-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-faint">
            <span className="h-px flex-1 bg-[rgba(200,162,78,0.22)]" />
            sau cu email
            <span className="h-px flex-1 bg-[rgba(200,162,78,0.22)]" />
          </div>

          <div className="space-y-2.5">
            <TextField
              leftIcon={<Mail className="h-5 w-5" />}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              leftIcon={<Lock className="h-5 w-5" />}
              type="password"
              placeholder="Parolă"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {error && <p className="mt-2.5 text-sm font-medium text-risk-high">{error}</p>}

          <CButton
            variant="ghost"
            size="md"
            full
            onClick={submit}
            disabled={pending}
            rightIcon={!pending && <ArrowRight className="h-5 w-5" />}
            className="mt-2.5 border border-[color:var(--gold-border-strong)] text-accent-deep"
          >
            {pending ? "Se autentifică…" : "Autentifică-te cu email"}
          </CButton>

          <Link
            href="/onboarding/register"
            className="mt-2.5 flex items-center justify-center gap-1.5 text-sm font-semibold text-accent-deep"
          >
            Creează cont
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
