"use client";

import { ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiClientError, register } from "@/lib/api";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { CLabel } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { TextField } from "@/components/ui/text-field";

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

  return (
    <div className="cine-surface flex min-h-screen flex-1 flex-col px-6 pb-safe-bottom pt-12">
      <h1
        className="font-display text-4xl leading-tight tracking-tight text-espresso animate-c-fade-up"
        style={{ animationDelay: "40ms" }}
      >
        Creează cont
      </h1>
      <p
        className="mt-1.5 text-sm text-warm-muted animate-c-fade-up"
        style={{ animationDelay: "100ms" }}
      >
        Îți confirmăm numărul printr-un cod SMS.
      </p>

      <GoldCard
        elevated
        className="mt-6 space-y-5 p-5 animate-c-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        <div className="space-y-2 animate-c-fade-up" style={{ animationDelay: "220ms" }}>
          <CLabel htmlFor="reg-name">Nume complet</CLabel>
          <TextField
            id="reg-name"
            leftIcon={<User className="h-5 w-5" />}
            placeholder="Nume complet"
            value={form.fullName}
            onChange={set("fullName")}
          />
        </div>

        <div className="space-y-2 animate-c-fade-up" style={{ animationDelay: "280ms" }}>
          <CLabel htmlFor="reg-email">Email</CLabel>
          <TextField
            id="reg-email"
            type="email"
            leftIcon={<Mail className="h-5 w-5" />}
            placeholder="nume@email.ro"
            value={form.email}
            onChange={set("email")}
          />
        </div>

        <div className="space-y-2 animate-c-fade-up" style={{ animationDelay: "340ms" }}>
          <CLabel htmlFor="reg-phone">Număr de telefon</CLabel>
          <PhoneField
            id="reg-phone"
            placeholder="7xx xxx xxx"
            value={form.phone}
            onChange={set("phone")}
          />
        </div>

        <div className="space-y-2 animate-c-fade-up" style={{ animationDelay: "400ms" }}>
          <CLabel htmlFor="reg-password">Parolă</CLabel>
          <TextField
            id="reg-password"
            type="password"
            leftIcon={<Lock className="h-5 w-5" />}
            placeholder="Min. 8 caractere"
            value={form.password}
            onChange={set("password")}
          />
        </div>

        {error && <p className="text-sm font-medium text-risk-high">{error}</p>}

        <CButton
          variant="gold"
          size="lg"
          full
          onClick={submit}
          disabled={pending}
          rightIcon={!pending ? <ArrowRight className="h-5 w-5" /> : undefined}
        >
          {pending ? "Se creează…" : "Creează cont"}
        </CButton>
      </GoldCard>

      <p className="mt-5 text-center text-sm text-warm-muted">
        Ai deja cont?{" "}
        <Link href="/onboarding/login" className="font-semibold text-accent-deep">
          Autentifică-te
        </Link>
      </p>
    </div>
  );
}
