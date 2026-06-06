"use client";

import { ArrowRight, Lock, Mail, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CButton } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { CWord } from "@/components/ui/wordmark";
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
    <div className="relative flex min-h-screen flex-1 flex-col bg-espresso">
      {/* full-bleed cinematic hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/cine/window-hero.jpg"
          alt=""
          aria-hidden
          className="h-full w-full scale-110 object-cover object-[50%_44%] animate-c-fade"
        />
        {/* warm readability scrim — dark cabin top, deep base under the card */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,12,7,0.74) 0%, rgba(18,12,7,0.28) 30%, rgba(20,14,8,0.10) 50%, rgba(20,14,8,0.72) 84%, rgba(16,11,6,0.94) 100%)",
          }}
        />
      </div>

      {/* top wordmark */}
      <header
        className="relative z-10 flex justify-center px-6 pt-safe-top animate-c-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        <CWord size={30} light className="mt-3" />
      </header>

      {/* tagline */}
      <section className="relative z-10 px-8 pt-10 text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-white/[0.12] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-glass animate-c-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Copilotul tău calm
        </span>
        <h1
          className="mt-5 font-display text-[2.35rem] leading-[1.06] tracking-[0.01em] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.6)] animate-c-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          Claritate când
          <br />
          <span className="italic text-sky">zborurile se strică.</span>
        </h1>
      </section>

      <div className="flex-1" />

      {/* login card floating over the hero */}
      <div className="relative z-10 px-4 pb-safe-bottom">
        <div
          className={cn(
            "rounded-card border border-accent/40 bg-ivory/95 px-6 pb-7 pt-5 backdrop-blur-xl animate-c-fade-up",
            "shadow-[0_-10px_40px_rgba(20,14,8,0.34),inset_0_1px_0_rgba(255,255,255,0.8)]",
          )}
          style={{ animationDelay: "300ms" }}
        >
          {/* grab handle */}
          <div className="mx-auto mb-5 h-[5px] w-11 rounded-full bg-accent/25" />

          <h2
            className="font-display text-3xl leading-tight tracking-tight text-espresso animate-c-fade-up"
            style={{ animationDelay: "360ms" }}
          >
            Bine ai revenit.
          </h2>
          <p
            className="mt-1.5 text-warm-muted animate-c-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            Intră în contul tău Aerly.
          </p>

          <div
            className="mt-6 space-y-3 animate-c-fade-up"
            style={{ animationDelay: "440ms" }}
          >
            <TextField
              leftIcon={<Mail className="h-5 w-5" />}
              type="email"
              autoFocus
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

          {error && (
            <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>
          )}

          <CButton
            variant="gold"
            size="lg"
            full
            onClick={submit}
            disabled={pending}
            rightIcon={!pending && <ArrowRight className="h-5 w-5" />}
            className="mt-6 animate-c-fade-up"
            style={{ animationDelay: "480ms" }}
          >
            {pending ? "Se autentifică…" : "Autentifică-te"}
          </CButton>

          {/* gold divider */}
          <div
            className="my-4 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(200,162,78,0.22) 30%, rgba(200,162,78,0.22) 70%, transparent)",
            }}
          />

          <Link
            href="/onboarding/phone"
            className="inline-flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-button border border-[rgba(200,167,97,0.65)] bg-ivory/95 px-7 text-base font-semibold tracking-tight text-espresso shadow-ivory-button transition-all duration-150 ease-cinematic active:scale-[0.98]"
          >
            Intră cu numărul de telefon
            <Smartphone className="h-5 w-5" />
          </Link>

          <p className="mt-4 text-center text-sm text-warm-muted">
            Nu ai cont?{" "}
            <Link
              href="/onboarding/register"
              className="font-semibold text-accent-deep"
            >
              Creează cont
            </Link>
          </p>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-warm-faint">
            <Lock className="h-3.5 w-3.5" />
            Îți trimitem un cod unic ca să confirmăm că ești tu.
          </p>
        </div>
      </div>
    </div>
  );
}
