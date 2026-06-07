"use client";

import { BellRing, Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { fireDemoAlert } from "@/lib/api";
import { DEMO_PHONE, syncDemoFromQuery } from "@/lib/demo";
import { cn } from "@/lib/utils";

type State = "idle" | "sending" | "done" | "error";

/** Presenter-only floating button. Visible when ?demo=1 has been set.
 *  One tap fires the proactive scan so the alert lands on subscribed devices. */
export function DemoTrigger() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    setEnabled(syncDemoFromQuery());
  }, []);

  if (!enabled) return null;

  async function fire() {
    if (state === "sending") return;
    setState("sending");
    try {
      // Targets the demo account so the alert lands on WhatsApp + push + SMS.
      await fireDemoAlert(DEMO_PHONE);
      setState("done");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2600);
  }

  const label =
    state === "sending"
      ? "Se trimite…"
      : state === "done"
        ? "Alertă trimisă"
        : state === "error"
          ? "Eroare"
          : "Declanșează alerta";

  const Icon =
    state === "sending" ? Loader2 : state === "done" ? Check : state === "error" ? X : BellRing;

  return (
    <button
      type="button"
      onClick={fire}
      aria-label="Declanșează alerta de demo"
      className={cn(
        "fixed bottom-[88px] right-4 z-40 flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold tracking-tight shadow-gold-button transition-all duration-150 ease-cinematic active:scale-95 lg:bottom-6",
        state === "done"
          ? "bg-risk-low text-white"
          : state === "error"
            ? "bg-risk-high text-white"
            : "border border-[rgba(217,189,116,0.9)] bg-gradient-to-br from-accent-soft via-accent to-accent-deep text-espresso",
      )}
    >
      <Icon className={cn("h-5 w-5", state === "sending" && "animate-spin")} strokeWidth={2.2} />
      {label}
    </button>
  );
}
