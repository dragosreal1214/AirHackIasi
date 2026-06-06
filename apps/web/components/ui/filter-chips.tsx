"use client";

import { cn } from "@/lib/utils";

export interface FilterChipOption<T extends string = string> {
  value: T;
  label: string;
}

export interface FilterChipsProps<T extends string = string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterChips<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm transition-all duration-150",
              active
                ? "border-0 bg-gradient-to-br from-accent to-accent-deep font-bold text-white shadow-[0_2px_8px_rgba(200,162,78,0.25)]"
                : "border border-[color:var(--gold-border)] bg-white/60 font-medium text-espresso backdrop-blur-glass",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
