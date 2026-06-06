"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

export interface OtpInputProps {
  /** Current value — the joined digits string (0–6 chars). */
  value: string;
  /** Emits the joined digits string on every change. */
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({ value, onChange, disabled, className }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split("").slice(0, LENGTH);

  const setCharAt = (index: number, char: string) => {
    const next = value.split("");
    next[index] = char;
    // collapse to a clean digits string, trimming trailing empties
    return next.join("").replace(/\s/g, "").slice(0, LENGTH);
  };

  const focusCell = (index: number) => {
    const el = refs.current[Math.max(0, Math.min(LENGTH - 1, index))];
    el?.focus();
    el?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    onChange(setCharAt(index, digit));
    if (index < LENGTH - 1) focusCell(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        onChange(setCharAt(index, ""));
      } else if (index > 0) {
        onChange(setCharAt(index - 1, ""));
        focusCell(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    const chars = value.split("");
    for (let i = 0; i < pasted.length && index + i < LENGTH; i++) {
      chars[index + i] = pasted[i];
    }
    const next = chars.join("").slice(0, LENGTH);
    onChange(next);
    focusCell(Math.min(index + pasted.length, LENGTH - 1));
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length: LENGTH }).map((_, i) => {
        const filled = Boolean(digits[i]);
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={digits[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              "h-[62px] min-w-0 flex-1 rounded-otp border-2 bg-white/90 text-center text-2xl font-bold text-espresso shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-all duration-150",
              filled
                ? "border-accent bg-accent-soft/10"
                : "border-[color:var(--gold-border)]",
              "focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_srgb,rgb(var(--color-accent))_16%,transparent)]",
              "disabled:opacity-50",
            )}
          />
        );
      })}
    </div>
  );
}
