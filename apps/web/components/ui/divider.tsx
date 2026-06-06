import { cn } from "@/lib/utils";

export interface GoldDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function GoldDivider({ className, ...props }: GoldDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "mx-1 h-px bg-gradient-to-r from-transparent via-[rgba(200,162,78,0.22)] to-transparent",
        className,
      )}
      {...props}
    />
  );
}
