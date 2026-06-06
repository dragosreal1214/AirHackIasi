"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const MONTHS = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];
const SHORT = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];
const WEEKDAYS = ["L", "Ma", "Mi", "J", "V", "S", "D"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function pretty(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return `${d} ${SHORT[m - 1]}. ${y}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Alege data",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const seed = value
    ? value.split("-").map(Number)
    : [today.getFullYear(), today.getMonth() + 1, today.getDate()];
  const [view, setView] = useState({ y: seed[0], m: seed[1] - 1 });

  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday-first
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());

  const step = (dir: -1 | 1) =>
    setView((v) => {
      const m = v.m + dir;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center gap-3 rounded-input border border-[color:var(--gold-border)] bg-white/70 px-4 text-left transition-colors duration-150 hover:border-accent/60"
      >
        <Calendar className="h-5 w-5 flex-shrink-0 text-accent-deep" />
        <span className={cn("text-[15px]", value ? "font-semibold text-espresso" : "text-warm-faint")}>
          {value ? pretty(value) : placeholder}
        </span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md animate-c-fade-up rounded-t-[28px] border-t border-accent/30 bg-cream px-5 pb-safe-bottom pt-3 shadow-[0_-10px_40px_rgba(20,14,8,0.34)]">
            <div className="mx-auto mb-4 h-[5px] w-11 rounded-full bg-accent/25" />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Luna anterioară"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gold-border)] bg-white/70 text-warm-ink active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-display text-lg tracking-tight text-espresso">
                {MONTHS[view.m]} {view.y}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Luna următoare"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gold-border)] bg-white/70 text-warm-ink active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-warm-faint">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1 pb-3">
              {cells.map((d, i) =>
                d === null ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(iso(view.y, view.m, d));
                      setOpen(false);
                    }}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      value === iso(view.y, view.m, d)
                        ? "bg-accent text-espresso shadow-gold-button"
                        : iso(view.y, view.m, d) === todayIso
                          ? "text-accent-deep ring-1 ring-accent/40"
                          : "text-warm-ink hover:bg-accent/15",
                    )}
                  >
                    {d}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
