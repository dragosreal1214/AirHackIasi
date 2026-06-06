"use client";

import { getPushPublicKey, savePushSubscription } from "@/lib/api";

export type PushResult =
  | "ok"
  | "denied"
  | "unsupported"
  | "disabled"
  | "no-backend"
  | "subscribe-failed"
  | "save-failed";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Ask permission, subscribe via the service worker, and save it to the backend. */
export async function subscribeToPush(): Promise<PushResult> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }

  // 1. Get the VAPID public key from the backend.
  let publicKey = "";
  let enabled = false;
  try {
    const r = await getPushPublicKey();
    publicKey = r.publicKey;
    enabled = r.enabled;
  } catch (e) {
    console.error("[push] could not reach backend for public key:", e);
    return "no-backend";
  }
  if (!enabled || !publicKey) return "disabled";

  // 2. Permission.
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  // 3. Subscribe via the service worker.
  let sub: PushSubscription | null;
  try {
    const reg = await navigator.serviceWorker.ready;
    sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }
  } catch (e) {
    console.error("[push] pushManager.subscribe failed:", e);
    return "subscribe-failed";
  }

  // 4. Save the subscription to the backend (needs auth + reachable API).
  try {
    await savePushSubscription(sub.toJSON());
  } catch (e) {
    console.error("[push] saving subscription failed:", e);
    return "save-failed";
  }
  return "ok";
}

export function pushPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
