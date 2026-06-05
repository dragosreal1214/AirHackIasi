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
  FlightSummary,
  PnrStatus,
  PnrWithFlight,
} from "@aerly/shared";

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

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
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

export async function searchFlights(
  query: string,
  date?: string,
): Promise<FlightSummary[]> {
  if (USE_MOCKS) {
    await delay(250);
    const q = query.trim().toLowerCase().replace(/\s+/g, "");
    if (!q) return [];
    return FLIGHT_CATALOG.filter((f) =>
      f.flightNumber.toLowerCase().replace(/\s+/g, "").includes(q),
    );
  }
  const params = new URLSearchParams({ q: query });
  if (date) params.set("date", date);
  return http(`/flights/search?${params.toString()}`);
}

// ---------------------------------------------------------------------------
// Disruptions & alternatives
// ---------------------------------------------------------------------------

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

export { ApiClientError, USE_MOCKS };
