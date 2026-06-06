"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface PhoneFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Class applied to the outer container wrapper. */
  containerClassName?: string;
}

export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-[58px] items-stretch overflow-hidden rounded-input border-2 border-[color:var(--gold-border)] bg-white/90 shadow-glass transition-all duration-200",
          "focus-within:border-accent focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,rgb(var(--color-accent))_16%,transparent),inset_0_1px_0_rgba(255,255,255,0.8)]",
          containerClassName,
        )}
      >
        <div className="flex shrink-0 items-center gap-1.5 border-r border-[color:var(--gold-border)] px-4 text-base font-medium text-espresso">
          <span aria-hidden className="text-lg leading-none">
            🇷🇴
          </span>
          <span>+40</span>
        </div>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent px-4 py-0 text-lg font-medium text-espresso outline-none placeholder:text-espresso/50",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
PhoneField.displayName = "PhoneField";
