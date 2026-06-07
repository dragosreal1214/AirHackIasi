/** Demo mode — a presenter-only flag toggled via ?demo=1 (and ?demo=0 to clear).
 *
 * When on: the hub greeting shows the fog state and a one-click alert trigger
 * floats over the app. Persisted in localStorage so it survives navigation. */
export const DEMO_KEY = "fogora_demo";

/** The demo account — alerts are sent here (incl. WhatsApp) during a demo. */
export const DEMO_PHONE = "+40770675731";

export function isDemoEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_KEY) === "1";
}

/** Reads ?demo= from the URL, persists it, and returns the resulting state. */
export function syncDemoFromQuery(): boolean {
  if (typeof window === "undefined") return false;
  const v = new URLSearchParams(window.location.search).get("demo");
  if (v === "1") window.localStorage.setItem(DEMO_KEY, "1");
  else if (v === "0") window.localStorage.removeItem(DEMO_KEY);
  return isDemoEnabled();
}
