"use client";

/** Minimal client-side token storage (localStorage). */

const ACCESS = "aerly_access_token";
const REFRESH = "aerly_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(ACCESS, accessToken);
  window.localStorage.setItem(REFRESH, refreshToken);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS);
  window.localStorage.removeItem(REFRESH);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
