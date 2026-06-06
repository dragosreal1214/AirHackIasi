import { cn } from "@/lib/utils";

export interface CLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function CLabel({ className, children, ...props }: CLabelProps) {
  return (
    <label
      className={cn(
        "block text-[11px] font-bold uppercase tracking-[0.14em] text-accent-deep/70",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
