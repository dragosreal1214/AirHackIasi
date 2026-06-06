"use client";

import { ArrowRight, Lock, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { CWord } from "@/components/ui/wordmark";
import { ApiClientError, loginEmail } from "@/lib/api";
import { setTokens } from "@/lib/auth";

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
    <div className="flex flex-1 flex-col px-6 pt-safe-top pb-safe-bottom animate-fade-up">
      <div className="pt-12">
        <CWord size={36} />
      </div>

      <GoldCard elevated className="mt-8 p-6">
        <h1 className="font-display text-4xl leading-tight tracking-tight text-espresso">
          Bine ai revenit.
        </h1>
        <p className="mt-2 text-warm-muted">Intră în contul tău Aerly.</p>

        <div className="mt-7 space-y-3">
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
          className="mt-6"
        >
          {pending ? "Se autentifică…" : "Autentifică-te"}
        </CButton>

        <Link
          href="/onboarding/phone"
          className="mt-3 inline-flex h-16 w-full items-center justify-center gap-2 whitespace-nowrap rounded-button border border-[rgba(200,167,97,0.65)] bg-ivory/95 px-7 text-lg font-semibold tracking-tight text-espresso shadow-ivory-button transition-all duration-150 ease-cinematic active:scale-[0.98]"
        >
          Intră cu numărul de telefon
          <Smartphone className="h-5 w-5" />
        </Link>
      </GoldCard>

      <p className="mt-6 text-center text-sm text-warm-muted">
        Nu ai cont?{" "}
        <Link
          href="/onboarding/register"
          className="font-semibold text-accent-deep"
        >
          Creează cont
        </Link>
      </p>
    </div>
  );
}
