"use client";

import { ArrowRight, ChevronDown, Lock, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CButton } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ApiClientError, loginEmail } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0); // scroll progress 0..1
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const range = el.clientHeight * 0.7;
      setP(Math.max(0, Math.min(1, el.scrollTop / range)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const toLogin = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

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

  const scale = 1.06 + p * 0.42;
  const dim = 0.16 + p * 0.46;

  return (
    <div
      ref={scrollRef}
      className="no-sb relative h-[100dvh] overflow-x-hidden overflow-y-auto bg-espresso"
    >
      {/* sticky cinematic hero */}
      <div className="sticky top-0 z-[1] h-[100dvh] overflow-hidden">
        <img
          src="/cine/login-plane-window.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[50%_46%] will-change-transform"
          style={{ transform: `scale(${scale}) translateY(${p * -16}px)`, transition: "transform .08s linear" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(18,12,7,${0.62 + p * 0.18}) 0%, rgba(18,12,7,${0.2 + p * 0.1}) 34%, rgba(20,14,8,0) 56%, rgba(20,14,8,${0.45 + p * 0.3}) 100%)`,
          }}
        />
        <div className="absolute inset-0" style={{ background: `rgba(18,12,7,${dim - 0.16})` }} />

        {/* Fogora logo + tagline — stacked, no overlap */}
        <div
          className="absolute left-0 right-0 flex flex-col items-center px-8 pt-safe-top text-center"
          style={{ transform: `translateY(${p * -22}px) scale(${1 - p * 0.04})`, opacity: 1 - p * 1.1 }}
        >
          <img
            src="/cine/fogora-mark-256.png"
            alt="Fogora"
            className="mt-3 h-[88px] w-[88px] object-contain drop-shadow-[0_6px_26px_rgba(0,0,0,0.55)]"
          />
          <h1 className="mt-5 font-display text-[2.1rem] leading-[1.06] tracking-[0.01em] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.6)]">
            Claritate când
            <br />
            <span className="italic text-sky">zborurile se strică.</span>
          </h1>
        </div>

        {/* scroll hint */}
        <button
          type="button"
          onClick={toLogin}
          className="absolute left-0 right-0 flex flex-col items-center gap-1.5 px-8 text-white/90"
          style={{ bottom: "40px", opacity: Math.max(0, 1 - p * 2.2) }}
        >
          <p className="mx-auto mb-2.5 max-w-[270px] text-center text-sm leading-[1.5] text-white/80 [text-shadow:0_1px_14px_rgba(0,0,0,0.4)]">
            Gestionează perturbarea zborului cu mintea limpede — alternative, drepturi și pașii următori, într-un singur loc.
          </p>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Începe</span>
          <ChevronDown className="h-5 w-5 animate-hint-bob" />
        </button>
      </div>

      {/* scroll distance */}
      <div className="h-[70%]" />

      {/* login card rises over the hero */}
      <div className="relative z-[2] -mt-7 px-3.5 pb-safe-bottom">
        <div
          className={cn(
            "rounded-[28px_28px_22px_22px] border border-accent/40 bg-ivory/95 px-6 pb-7 pt-2.5 backdrop-blur-xl",
            "shadow-[0_-10px_40px_rgba(20,14,8,0.34),inset_0_1px_0_rgba(255,255,255,0.8)]",
          )}
        >
          <div className="mx-auto mb-5 h-[5px] w-11 rounded-full bg-accent/25" />

          <h2 className="font-display text-3xl leading-tight tracking-tight text-espresso">
            Verifică un zbor.
          </h2>
          <p className="mt-1.5 text-warm-muted">
            Intri direct, fără cont — vezi statusul și riscul de perturbare.
          </p>

          {/* PRIMARY: continue as guest, no account */}
          <CButton
            variant="gold"
            size="lg"
            full
            onClick={continueAsGuest}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="mt-6"
          >
            Verifică un zbor — fără cont
          </CButton>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-warm-faint">
            <Lock className="h-3.5 w-3.5" />
            Ai nevoie de cont doar pentru alerte în timp real.
          </p>

          <div
            className="my-5 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(200,162,78,0.22) 30%, rgba(200,162,78,0.22) 70%, transparent)",
            }}
          />

          {/* SECONDARY: email/password login */}
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-warm-faint">
            Ai deja cont?
          </p>

          <div className="space-y-3">
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

          {error && <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>}

          <CButton
            variant="ivory"
            size="md"
            full
            onClick={submit}
            disabled={pending}
            rightIcon={!pending && <ArrowRight className="h-5 w-5" />}
            className="mt-4"
          >
            {pending ? "Se autentifică…" : "Autentifică-te"}
          </CButton>

          <Link
            href="/onboarding/register"
            className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-accent-deep"
          >
            Creează cont
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/onboarding/phone"
            className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-accent-deep"
          >
            <Smartphone className="h-4 w-4" />
            Intră cu numărul de telefon
          </Link>
        </div>
      </div>
    </div>
  );
}
