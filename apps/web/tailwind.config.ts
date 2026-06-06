import type { Config } from "tailwindcss";

/** Aerly Cinematic design tokens. CSS variables live in app/globals.css. */
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: c("--color-primary"),
        accent: {
          DEFAULT: c("--color-accent"),
          deep: c("--color-accent-deep"),
          soft: c("--color-accent-soft"),
        },
        sky: {
          DEFAULT: c("--color-sky"),
          deep: c("--color-sky-deep"),
          ink: c("--color-sky-ink"),
        },
        espresso: c("--color-espresso"),
        ivory: c("--color-ivory"),
        cream: c("--color-cream"),
        warm: {
          ink: c("--color-warm-ink"),
          muted: c("--color-warm-muted"),
          faint: c("--color-warm-faint"),
        },
        risk: {
          low: c("--color-risk-low"),
          moderate: c("--color-risk-moderate"),
          high: c("--color-risk-high"),
          critical: c("--color-risk-critical"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        button: "16px",
        card: "22px",
        input: "16px",
        otp: "14px",
        icon: "12px",
      },
      backdropBlur: {
        glass: "18px",
        lg: "14px",
        xl: "20px",
      },
      spacing: {
        "safe-top": "50px",
        "safe-bottom": "22px",
      },
      boxShadow: {
        glass: "0 10px 30px rgba(33,24,14,0.10)",
        "gold-button":
          "0 2px 10px rgba(168,132,47,0.28), 0 10px 30px rgba(168,132,47,0.22), 0 0 12px rgba(200,167,97,0.16)",
        "ivory-button": "0 6px 20px rgba(20,14,8,0.18), 0 0 12px rgba(200,167,97,0.16)",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(.2,.7,.2,1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // --- Demo cinematic vocabulary (Aerly Cinematic.html @keyframes) ---
        "c-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "c-fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "c-scale-in": {
          from: { opacity: "0", transform: "scale(.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "hint-bob": {
          "0%,100%": { transform: "translateY(0)", opacity: ".8" },
          "50%": { transform: "translateY(7px)", opacity: "1" },
        },
        "ring-draw": {
          from: { strokeDashoffset: "301" },
          to: { strokeDashoffset: "0" },
        },
        "draw-check": {
          from: { strokeDashoffset: "60" },
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up .4s cubic-bezier(.2,.7,.2,1) both",
        "scale-in": "scale-in .3s cubic-bezier(.2,.7,.2,1) both",
        shimmer: "shimmer 1.6s linear infinite",
        // --- Demo cinematic vocabulary ---
        "c-fade": "c-fade .5s cubic-bezier(.2,.7,.2,1) both",
        "c-fade-up": "c-fade-up .55s cubic-bezier(.2,.7,.2,1) both",
        "c-scale-in": "c-scale-in .4s cubic-bezier(.2,.7,.2,1) both",
        "hint-bob": "hint-bob 1.8s ease-in-out infinite",
        "ring-draw": "ring-draw .7s cubic-bezier(.3,.7,.3,1) .1s both",
        "draw-check": "draw-check .4s ease-out .55s both",
      },
    },
  },
  plugins: [],
};

export default config;
