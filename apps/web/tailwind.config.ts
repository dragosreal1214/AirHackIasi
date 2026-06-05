import type { Config } from "tailwindcss";

/** Aerly design tokens. CSS variables are defined in app/globals.css. */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        risk: {
          low: "rgb(var(--color-risk-low) / <alpha-value>)",
          moderate: "rgb(var(--color-risk-moderate) / <alpha-value>)",
          high: "rgb(var(--color-risk-high) / <alpha-value>)",
          critical: "rgb(var(--color-risk-critical) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
