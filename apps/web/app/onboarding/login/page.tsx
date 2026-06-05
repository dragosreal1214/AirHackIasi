"use client";

import { ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="flex flex-1 flex-col px-6 pt-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Bine ai revenit.
      </h1>
      <p className="mt-2 text-slate-500">Intră în contul tău Aerly.</p>

      <div className="mt-8 space-y-3">
        <input
          className={input}
          type="email"
          autoFocus
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={input}
          type="password"
          placeholder="Parolă"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Se autentifică…" : "Autentifică-te"}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>

      <Link
        href="/onboarding/phone"
        className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-700"
      >
        <Smartphone className="h-4 w-4" />
        Intră cu numărul de telefon
      </Link>

      <p className="mt-6 text-center text-sm text-slate-500">
        Nu ai cont?{" "}
        <Link href="/onboarding/register" className="font-semibold text-primary">
          Creează cont
        </Link>
      </p>
    </div>
  );
}
