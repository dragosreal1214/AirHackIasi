/**
 * Aerly API client.
 *
 * When `NEXT_PUBLIC_API_URL` is set, calls the real FastAPI backend.
 * Otherwise it serves the in-memory mocks from `lib/mock-data.ts` so the
 * phone app is fully clickable with no backend running.
 *
 * The function surface is identical in both modes — wiring the real backend
 * is just setting the env var (and implementing the matching endpoints).
 */

import type {
  Alternative,
  CreatePnrInput,
  Disruption,
  FlightDetail,
  FlightSummary,
  FogTimeline,
  LoginInput,
  Me,
  OpsAirport,
  UpdateMeInput,
  PhoneStartResponse,
  PnrStatus,
  PnrWithFlight,
  RegisterInput,
  TokenResponse,
} from "@aerly/shared";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import {
  ALTERNATIVES,
  DISRUPTIONS,
  FLIGHT_CATALOG,
  nextPnrId,
  PNR_STORE,
} from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCKS = !API_URL;

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

let _refreshing: Promise<boolean> | null = null;

/** Exchange the refresh token for a fresh pair. Deduped across concurrent 401s. */
async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (!_refreshing) {
    _refreshing = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const t = await res.json();
        setTokens(t.accessToken, t.refreshToken);
        return true;
      } catch {
        return false;
      }
    })();
  }
  const ok = await _refreshing;
  _refreshing = null;
  return ok;
}

async function http<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  // Access token expired: refresh once and retry (never for /auth/* itself).
  if (res.status === 401 && !retried && !path.startsWith("/auth/")) {
    if (await tryRefresh()) return http(path, init, true);
    clearTokens();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiClientError(
      body?.detail?.code ?? "API_ERROR",
      body?.detail?.message ?? `Request failed (${res.status})`,
    );
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---------------------------------------------------------------------------
// PNRs
// ---------------------------------------------------------------------------

export async function getPnrs(
  status: PnrStatus = "active",
): Promise<PnrWithFlight[]> {
  if (USE_MOCKS) {
    await delay();
    return PNR_STORE.filter((p) => p.status === status);
  }
  return http(`/pnrs?status=${status}`);
}

export async function addPnr(input: CreatePnrInput): Promise<PnrWithFlight> {
  if (USE_MOCKS) {
    await delay();
    const flight = FLIGHT_CATALOG.find((f) => f.id === input.flightId);
    if (!flight) throw new ApiClientError("FLIGHT_NOT_FOUND", "Zborul nu există.");
    if (PNR_STORE.some((p) => p.flight.id === flight.id && p.status === "active")) {
      throw new ApiClientError(
        "PNR_ALREADY_EXISTS",
        "Acest zbor este deja în lista ta.",
      );
    }
    const disruption = Object.values(DISRUPTIONS).find(
      (d) => d.flight.id === flight.id,
    );
    const pnr: PnrWithFlight = {
      id: nextPnrId(),
      status: "active",
      passengerName: input.passengerName,
      seatNumber: input.seatNumber,
      pnrCode: input.pnrCode,
      flight,
      currentRisk: disruption?.risk ?? {
        level: "low",
        probability: 0.06,
        predictionFor: flight.scheduledDeparture,
      },
      disruptionId: disruption?.id ?? null,
    };
    PNR_STORE.push(pnr);
    return pnr;
  }
  return http(`/pnrs`, { method: "POST", body: JSON.stringify(input) });
}

export async function deletePnr(id: string): Promise<void> {
  if (USE_MOCKS) {
    await delay();
    const pnr = PNR_STORE.find((p) => p.id === id);
    if (pnr) pnr.status = "cancelled";
    return;
  }
  await http(`/pnrs/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Flights
// ---------------------------------------------------------------------------

export interface FlightSearchParams {
  q?: string;
  date?: string;
  origin?: string;
  destination?: string;
  time?: string;
}

export async function searchFlights(
  params: FlightSearchParams,
): Promise<FlightSummary[]> {
  const { q, date, origin, destination, time } = params;
  if (USE_MOCKS) {
    await delay(250);
    const needle = (q ?? "").trim().toLowerCase().replace(/\s+/g, "");
    return FLIGHT_CATALOG.filter((f) => {
      if (needle && !f.flightNumber.toLowerCase().replace(/\s+/g, "").includes(needle))
        return false;
      if (origin && !f.originIata.toLowerCase().includes(origin.toLowerCase())) return false;
      if (destination && !f.destinationIata.toLowerCase().includes(destination.toLowerCase()))
        return false;
      return true;
    });
  }
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (date) sp.set("date", date);
  if (origin) sp.set("origin", origin);
  if (destination) sp.set("destination", destination);
  if (time) sp.set("time", time);
  return http(`/flights/search?${sp.toString()}`);
}

// ---------------------------------------------------------------------------
// Disruptions & alternatives
// ---------------------------------------------------------------------------

export async function getFlightDetail(flightId: string): Promise<FlightDetail> {
  if (USE_MOCKS) {
    await delay();
    const flight = FLIGHT_CATALOG.find((f) => f.id === flightId) ?? FLIGHT_CATALOG[0];
    const d = DISRUPTIONS.d_001;
    return {
      flight,
      risk: d.risk,
      destinationRisk: null,
      cancelProbability: d.risk.probability,
      weather: [
        { key: "fog", label: "Ceață", value: d.risk.probability, level: d.risk.level },
        { key: "bad_weather", label: "Vreme rea", value: 0.4, level: "moderate" },
        { key: "overall", label: "General", value: 0.55, level: "moderate" },
      ],
      info: { terminal: "T4", gate: "G12", baggageBelt: "Banda 3", durationMinutes: 75 },
      timeline: [],
      disruptionId: flight.id === "fl_ro632" ? "d_001" : null,
      alternativesCount: 4,
    };
  }
  return http(`/flights/${encodeURIComponent(flightId)}`);
}

export async function getDisruption(id: string): Promise<Disruption> {
  if (USE_MOCKS) {
    await delay();
    const d = DISRUPTIONS[id];
    if (!d) throw new ApiClientError("DISRUPTION_NOT_FOUND", "Alertă inexistentă.");
    return d;
  }
  return http(`/disruptions/${id}`);
}

export async function getAlternatives(
  disruptionId: string,
): Promise<Alternative[]> {
  if (USE_MOCKS) {
    await delay(500);
    return ALTERNATIVES[disruptionId] ?? [];
  }
  return http(`/disruptions/${disruptionId}/alternatives`);
}

export async function selectAlternative(alternativeId: string): Promise<void> {
  if (USE_MOCKS) {
    await delay(200);
    return;
  }
  await http(`/alternatives/${alternativeId}/select`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function register(
  input: RegisterInput,
): Promise<PhoneStartResponse> {
  if (USE_MOCKS) {
    await delay(300);
    return { challengeId: "mock-challenge", method: "dev" };
  }
  return http(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginEmail(input: LoginInput): Promise<TokenResponse> {
  if (USE_MOCKS) {
    await delay(300);
    return { accessToken: "mock-access", refreshToken: "mock-refresh", tokenType: "bearer" };
  }
  return http(`/auth/login`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function startPhoneVerification(
  phoneNumber: string,
): Promise<PhoneStartResponse> {
  if (USE_MOCKS) {
    await delay(300);
    return { challengeId: "mock-challenge", method: "dev" };
  }
  return http(`/auth/phone/start`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber }),
  });
}

export async function verifyOtp(
  challengeId: string,
  code: string,
): Promise<TokenResponse> {
  if (USE_MOCKS) {
    await delay(300);
    if (code !== "000000") {
      throw new ApiClientError("INVALID_OTP", "Cod greșit. Mai încearcă.");
    }
    return { accessToken: "mock-access", refreshToken: "mock-refresh", tokenType: "bearer" };
  }
  return http(`/auth/phone/verify`, {
    method: "POST",
    body: JSON.stringify({ challengeId, code }),
  });
}

// ---------------------------------------------------------------------------
// Fog forecast / ops timeline
// ---------------------------------------------------------------------------

export async function getAirports(): Promise<OpsAirport[]> {
  if (USE_MOCKS) {
    await delay();
    return [{ iata: "IAS", name: "Iași", city: "Iași", country: "RO" }];
  }
  return http(`/ml/airports`);
}

export async function getForecast(airport = "IAS"): Promise<FogTimeline> {
  if (USE_MOCKS) {
    await delay();
    return { source: "open-meteo", available: true, hourly: [], windows: [], peak: null };
  }
  return http(`/ml/forecast?airport=${airport}`);
}

export async function getTimeline(date: string): Promise<FogTimeline> {
  if (USE_MOCKS) {
    await delay();
    return { source: "replay", available: true, date, hourly: [], windows: [], peak: null };
  }
  return http(`/ml/timeline?date=${date}`);
}

// ---------------------------------------------------------------------------
// Current user (profile + notification channels)
// ---------------------------------------------------------------------------

const MOCK_ME: Me = {
  id: "demo-user",
  fullName: "Andrei Pop",
  phoneNumber: "+40700000000",
  preferredLanguage: "ro",
  notificationChannels: ["whatsapp", "sms"],
};

export async function getMe(): Promise<Me> {
  if (USE_MOCKS) {
    await delay(200);
    return MOCK_ME;
  }
  return http(`/me`);
}

export async function updateMe(input: UpdateMeInput): Promise<Me> {
  if (USE_MOCKS) {
    await delay(200);
    return { ...MOCK_ME, ...input } as Me;
  }
  return http(`/me`, { method: "PATCH", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Web Push
// ---------------------------------------------------------------------------

export async function getPushPublicKey(): Promise<{ publicKey: string; enabled: boolean }> {
  if (USE_MOCKS) {
    await delay(120);
    return { publicKey: "", enabled: false };
  }
  return http(`/push/public-key`);
}

export async function savePushSubscription(subscription: unknown): Promise<void> {
  if (USE_MOCKS) {
    await delay(120);
    return;
  }
  await http(`/push/subscribe`, { method: "POST", body: JSON.stringify(subscription) });
}

// ---------------------------------------------------------------------------
// B2B airport flight-risk board (public API, /api/public/v1)
// ---------------------------------------------------------------------------

export async function getAirportRiskBoard(
  iata: string,
  opts?: { date?: string; direction?: "departures" | "arrivals" | "all" },
): Promise<import("@aerly/shared").AirportRiskBoard> {
  const direction = opts?.direction ?? "departures";
  if (USE_MOCKS) {
    await delay();
    return {
      airport: { iata, name: `${iata} Airport`, city: iata, country: "RO" },
      date: new Date().toISOString().slice(0, 10),
      direction,
      airportFogRisk: { level: "high", probability: 0.88, predictionFor: "" },
      summary: { total: 2, atRisk: 1 },
      flights: [],
    };
  }
  const sp = new URLSearchParams();
  if (opts?.date) sp.set("date", opts.date);
  sp.set("direction", direction);
  const res = await fetch(
    `${API_URL}/api/public/v1/airports/${encodeURIComponent(iata)}/risk?${sp.toString()}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiClientError(
      body?.detail?.code ?? "API_ERROR",
      body?.detail?.message ?? `Request failed (${res.status})`,
    );
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Demo mode — one-click alert trigger (hits the dev endpoints)
// ---------------------------------------------------------------------------

export async function fireDemoAlert(phone?: string): Promise<unknown> {
  if (phone) {
    const res = await fetch(`${API_URL}/api/v1/dev/send-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, disruptionId: "d_001", channels: ["push", "whatsapp", "sms"] }),
    });
    if (!res.ok) throw new ApiClientError("DEMO", `Alerta a eșuat (${res.status})`);
    return res.json();
  }
  const res = await fetch(`${API_URL}/api/v1/dev/run-monitor?force_fog=IAS`, { method: "POST" });
  if (!res.ok) throw new ApiClientError("DEMO", `Scanarea a eșuat (${res.status})`);
  return res.json();
}

export { ApiClientError, USE_MOCKS };
