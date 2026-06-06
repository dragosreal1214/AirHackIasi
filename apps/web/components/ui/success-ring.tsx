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
        "relative grid animate-scale-in place-items-center",
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
          className="cring-ring"
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
          className="cring-check"
        />
      </svg>
      <style jsx>{`
        .cring-ring {
          animation: cRingDraw 0.7s cubic-bezier(0.3, 0.7, 0.3, 1) 0.1s both;
        }
        .cring-check {
          animation: cDrawCheck 0.4s ease-out 0.55s both;
        }
        @keyframes cRingDraw {
          from {
            stroke-dashoffset: 301;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes cDrawCheck {
          from {
            stroke-dashoffset: 60;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cring-ring,
          .cring-check {
            animation-duration: 0.01ms;
          }
        }
      `}</style>
    </div>
  );
}
