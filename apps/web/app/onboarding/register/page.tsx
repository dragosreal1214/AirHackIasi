"use client";

import { ArrowLeft, ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CButton } from "@/components/ui/button";
import { CLabel } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { TextField } from "@/components/ui/text-field";
import { ApiClientError, register } from "@/lib/api";

const RO_MOBILE = /^(\+40|0)7\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(input: string): string {
  const d = input.replace(/\s+/g, "");
  if (d.startsWith("0")) return "+40" + d.slice(1);
  if (d.startsWith("7")) return "+40" + d;
  return d;
}

type Field = "fullName" | "email" | "phone" | "password";

const STEPS: {
  field: Field;
  label: string;
  title: string;
  hint: string;
  validate: (v: string) => string | null;
}[] = [
  {
    field: "fullName",
    label: "Nume complet",
    title: "Cum te cheamă?",
    hint: "Așa te vom întâmpina în aplicație.",
    validate: (v) => (v.trim().length >= 2 ? null : "Introdu numele tău."),
  },
  {
    field: "email",
    label: "Email",
    title: "Care e emailul tău?",
    hint: "Îl folosești ca să te autentifici.",
    validate: (v) => (EMAIL.test(v.trim()) ? null : "Introdu un email valid."),
  },
  {
    field: "phone",
    label: "Număr de telefon",
    title: "Și numărul de telefon?",
    hint: "Aici primești alertele de ceață, pe WhatsApp/SMS.",
    validate: (v) =>
      RO_MOBILE.test(v.replace(/\s+/g, "")) ? null : "Introdu un mobil valid (07xx xxx xxx).",
  },
  {
    field: "password",
    label: "Parolă",
    title: "Alege o parolă.",
    hint: "Minim 8 caractere.",
    validate: (v) => (v.length >= 8 ? null : "Parola trebuie să aibă minim 8 caractere."),
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const current = STEPS[step];
  const value = form[current.field];
  const isLast = step === STEPS.length - 1;

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [current.field]: e.target.value });

  async function next() {
    const msg = current.validate(value);
    if (msg) return setError(msg);
    setError(null);
    if (!isLast) {
      setStep(step + 1);
      return;
    }
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
      sessionStorage.setItem("aerly_flow", "register");
      router.push("/onboarding/verify");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Ceva n-a mers. Reîncearcă.");
      setPending(false);
    }
  }

  function back() {
    setError(null);
    if (step === 0) router.push("/onboarding/login");
    else setStep(step - 1);
  }

  const icon = {
    fullName: <User className="h-5 w-5" />,
    email: <Mail className="h-5 w-5" />,
    password: <Lock className="h-5 w-5" />,
    phone: null,
  }[current.field];

  return (
    <div className="cine-surface flex min-h-[100dvh] flex-1 flex-col px-6 pb-safe-bottom pt-safe-top">
      {/* header: back + step progress */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={back}
          aria-label="Înapoi"
          className="-ml-1 flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[rgba(200,167,97,0.65)] bg-white/60 text-warm-ink shadow-[0_0_12px_rgba(200,167,97,0.16)] backdrop-blur-lg transition-all duration-120 ease-cinematic active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 flex-1 rounded-full transition-colors duration-300 " +
                (i <= step ? "bg-accent" : "bg-warm-faint/30")
              }
            />
          ))}
        </div>
      </div>

      <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep/70">
        Pasul {step + 1} din {STEPS.length}
      </p>

      {/* the step — re-mounts on change to replay the entrance */}
      <div key={step} className="mt-2 animate-c-fade-up">
        <h1 className="font-display text-[2rem] leading-tight tracking-tight text-espresso">
          {current.title}
        </h1>
        <p className="mt-2 text-sm text-warm-muted">{current.hint}</p>

        <div className="mt-7 space-y-2">
          <CLabel>{current.label}</CLabel>
          {current.field === "phone" ? (
            <PhoneField
              autoFocus
              placeholder="7xx xxx xxx"
              value={value}
              onChange={set}
              onKeyDown={(e) => e.key === "Enter" && next()}
            />
          ) : (
            <TextField
              autoFocus
              leftIcon={icon}
              type={
                current.field === "password"
                  ? "password"
                  : current.field === "email"
                    ? "email"
                    : "text"
              }
              placeholder={current.label}
              value={value}
              onChange={set}
              onKeyDown={(e) => e.key === "Enter" && next()}
            />
          )}
        </div>

        {error && <p className="mt-3 text-sm font-medium text-risk-high">{error}</p>}
      </div>

      <div className="flex-1" />

      <CButton
        variant="gold"
        size="lg"
        full
        onClick={next}
        disabled={pending}
        rightIcon={!pending && <ArrowRight className="h-5 w-5" />}
        className="mb-2"
      >
        {pending ? "Se creează…" : isLast ? "Creează cont" : "Continuă"}
      </CButton>

      {step === 0 && (
        <p className="mb-2 mt-1 text-center text-sm text-warm-muted">
          Ai deja cont?{" "}
          <Link href="/onboarding/login" className="font-semibold text-accent-deep">
            Autentifică-te
          </Link>
        </p>
      )}
    </div>
  );
}
