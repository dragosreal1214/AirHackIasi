"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { CButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const pad = (n: number) => String(n).padStart(2, "0");

export function TimePicker({
  value,
  onChange,
  placeholder = "Alege ora",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [h, m] = value ? value.split(":").map(Number) : [8, 0];
  const [sel, setSel] = useState<{ h: number; m: number }>({ h, m });

  function update(next: { h: number; m: number }) {
    setSel(next);
    onChange(`${pad(next.h)}:${pad(next.m)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center gap-3 rounded-input border border-[color:var(--gold-border)] bg-white/70 px-4 text-left transition-colors duration-150 hover:border-accent/60"
      >
        <Clock className="h-5 w-5 flex-shrink-0 text-accent-deep" />
        <span className={cn("text-[15px] tabular-nums", value ? "font-semibold text-espresso" : "text-warm-faint")}>
          {value || placeholder}
        </span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md animate-c-fade-up rounded-t-[28px] border-t border-accent/30 bg-cream px-5 pb-safe-bottom pt-3 shadow-[0_-10px_40px_rgba(20,14,8,0.34)]">
            <div className="mx-auto mb-3 h-[5px] w-11 rounded-full bg-accent/25" />

            <div className="flex items-center justify-between">
              <span className="font-display text-lg tracking-tight text-espresso">Ora</span>
              <span className="font-display text-2xl tabular-nums text-accent-deep">
                {pad(sel.h)}:{pad(sel.m)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-warm-faint">
                  Oră
                </div>
                <div className="no-sb grid max-h-48 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
                  {HOURS.map((hh) => (
                    <button
                      key={hh}
                      type="button"
                      onClick={() => update({ h: hh, m: sel.m })}
                      className={cn(
                        "rounded-icon py-2 text-sm font-semibold tabular-nums transition-colors",
                        sel.h === hh ? "bg-accent text-espresso" : "bg-white/60 text-warm-ink hover:bg-accent/15",
                      )}
                    >
                      {pad(hh)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-warm-faint">
                  Minute
                </div>
                <div className="no-sb grid max-h-48 grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                  {MINUTES.map((mm) => (
                    <button
                      key={mm}
                      type="button"
                      onClick={() => update({ h: sel.h, m: mm })}
                      className={cn(
                        "rounded-icon py-2 text-sm font-semibold tabular-nums transition-colors",
                        sel.m === mm ? "bg-accent text-espresso" : "bg-white/60 text-warm-ink hover:bg-accent/15",
                      )}
                    >
                      {pad(mm)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <CButton variant="gold" full className="mt-4" onClick={() => setOpen(false)}>
              Gata
            </CButton>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
