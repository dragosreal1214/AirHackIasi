"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiClientError, register } from "@/lib/api";

const RO_MOBILE = /^(\+40|0)7\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(input: string): string {
  const d = input.replace(/\s+/g, "");
  if (d.startsWith("0")) return "+40" + d.slice(1);
  if (d.startsWith("7")) return "+40" + d;
  return d;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setError(null);
    if (form.fullName.trim().length < 2) return setError("Introdu numele tău.");
    if (!EMAIL.test(form.email)) return setError("Introdu un email valid.");
    if (!RO_MOBILE.test(form.phone.replace(/\s+/g, "")))
      return setError("Introdu un număr de mobil valid (07xx xxx xxx).");
    if (form.password.length < 8)
      return setError("Parola trebuie să aibă minim 8 caractere.");

    const phoneNumber = normalizePhone(form.phone);
    setPending(true);
    try {
      const res = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber,
        password: form.password,
      });
      sessionStorage.setItem("aerly_challenge", res.challengeId);
      sessionStorage.setItem("aerly_phone", phoneNumber);
      sessionStorage.setItem("aerly_method", res.method);
      router.push("/onboarding/verify");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Ceva n-a mers. Reîncearcă.");
    } finally {
      setPending(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="flex flex-1 flex-col px-6 pt-12">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Creează cont</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Îți confirmăm numărul printr-un cod SMS.
      </p>

      <div className="mt-6 space-y-3">
        <input className={input} placeholder="Nume complet" value={form.fullName} onChange={set("fullName")} />
        <input className={input} type="email" placeholder="Email" value={form.email} onChange={set("email")} />
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <span className="text-sm font-medium text-slate-500">🇷🇴 +40</span>
          <input
            className="w-full bg-transparent py-3 text-sm outline-none"
            inputMode="tel"
            placeholder="7xx xxx xxx"
            value={form.phone}
            onChange={set("phone")}
          />
        </div>
        <input className={input} type="password" placeholder="Parolă (min. 8 caractere)" value={form.password} onChange={set("password")} />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Se creează…" : "Creează cont"}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-5 text-center text-sm text-slate-500">
        Ai deja cont?{" "}
        <Link href="/onboarding/login" className="font-semibold text-primary">
          Autentifică-te
        </Link>
      </p>
    </div>
  );
}
