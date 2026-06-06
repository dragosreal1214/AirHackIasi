"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon rendered on the left inside the field. */
  leftIcon?: React.ReactNode;
  /** Class applied to the outer container wrapper. */
  containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ leftIcon, className, containerClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          "group flex h-[58px] items-stretch overflow-hidden rounded-input border-2 border-[color:var(--gold-border)] bg-white/90 shadow-glass transition-all duration-200",
          "focus-within:border-accent focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,rgb(var(--color-accent))_16%,transparent),inset_0_1px_0_rgba(255,255,255,0.8)]",
          containerClassName,
        )}
      >
        {leftIcon ? (
          <span className="flex shrink-0 items-center pl-4 text-warm-muted">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
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
TextField.displayName = "TextField";
