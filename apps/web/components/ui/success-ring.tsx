"use client";

import { cn } from "@/lib/utils";

export interface CRingProps {
  /** Outer diameter in px. */
  size?: number;
  className?: string;
}

export function CRing({ size = 112, className }: CRingProps) {
  return (
    <div
      className={cn(
        "relative grid animate-c-scale-in place-items-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 112 112"
        width={size}
        height={size}
        fill="none"
        aria-hidden
        className="block -rotate-90"
      >
        <circle
          cx="56"
          cy="56"
          r="48"
          stroke="rgba(200,162,78,0.22)"
          strokeWidth="3"
        />
        <circle
          cx="56"
          cy="56"
          r="48"
          stroke="rgb(var(--color-accent))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="301"
          className="animate-ring-draw"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        width={size * 0.45}
        height={size * 0.45}
        fill="none"
        aria-hidden
        className="absolute"
      >
        <path
          d="M20 6 L9 17 L4 12"
          stroke="rgb(var(--color-accent-deep))"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          className="animate-draw-check"
        />
      </svg>
    </div>
  );
}
