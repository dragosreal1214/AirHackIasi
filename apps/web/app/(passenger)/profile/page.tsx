"use client";

import { LogOut, MessageCircle, Smartphone, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppBar } from "@/components/passenger/app-bar";
import { clearTokens } from "@/lib/auth";

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp", note: "Recomandat", on: true },
  { icon: Smartphone, label: "SMS", note: "Backup", on: true },
  { icon: User, label: "Push", note: "În aplicație", on: false },
];

export default function ProfilePage() {
  const router = useRouter();

  function logout() {
    clearTokens();
    router.replace("/onboarding/phone");
  }

  return (
    <>
      <AppBar title="Profil" />
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
            AP
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Andrei Pop</div>
            <div className="text-xs text-slate-500">+40 ••• ••• 678</div>
          </div>
        </div>

        <h2 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Canale de notificare
        </h2>
        <div className="space-y-2.5">
          {CHANNELS.map(({ icon: Icon, label, note, on }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <Icon className="h-5 w-5 text-slate-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{label}</div>
                <div className="text-xs text-slate-500">{note}</div>
              </div>
              <span
                className={`h-5 w-9 rounded-full p-0.5 transition ${on ? "bg-primary" : "bg-slate-200"}`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition ${on ? "translate-x-4" : ""}`}
                />
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600"
        >
          <LogOut className="h-4 w-4" />
          Deconectează-te
        </button>

        <p className="mt-6 px-1 text-center text-xs text-slate-400">
          Aerly · Cu un aer înainte.
        </p>
      </div>
    </>
  );
}
