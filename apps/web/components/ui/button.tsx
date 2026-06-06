import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight rounded-button transition-all duration-150 ease-cinematic active:scale-[0.98] disabled:opacity-50 disabled:cursor-default cursor-pointer",
  {
    variants: {
      variant: {
        gold: "bg-gradient-to-br from-accent-soft via-accent to-accent-deep border border-[rgba(217,189,116,0.9)] text-espresso shadow-gold-button",
        ivory:
          "bg-ivory/95 border border-[rgba(200,167,97,0.65)] text-espresso shadow-ivory-button",
        glass:
          "bg-white/[0.14] backdrop-blur-glass border border-[rgba(200,167,97,0.65)] text-white",
        ghost: "bg-transparent border-0 text-espresso",
      },
      size: {
        md: "h-14 px-6 text-base",
        lg: "h-16 px-7 text-lg",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
      full: false,
    },
  },
);

export interface CButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Optional icon rendered to the right of the children. */
  rightIcon?: React.ReactNode;
}

export const CButton = forwardRef<HTMLButtonElement, CButtonProps>(
  ({ className, variant, size, full, rightIcon, children, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(buttonVariants({ variant, size, full }), className)}
        {...props}
      >
        {children}
        {rightIcon ? <span className="inline-flex shrink-0">{rightIcon}</span> : null}
      </button>
    );
  },
);
CButton.displayName = "CButton";
