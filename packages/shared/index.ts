/**
 * Shared TypeScript types for Aerly — the contract between web and api.
 *
 * Keep these aligned with `docs/api-spec.md` and the API's Pydantic models.
 */

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type Language = "ro" | "en";

export type NotificationChannel = "whatsapp" | "sms" | "push";

export type FlightStatus =
  | "scheduled"
  | "delayed"
  | "boarding"
  | "departed"
  | "cancelled"
  | "diverted";

export type PnrStatus = "active" | "cancelled" | "completed" | "disrupted";

export type AlternativeType =
  | "train"
  | "alternate_flight"
  | "reroute_airport"
  | "bus";

export interface Airport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airlineCode: string;
  originIata: string;
  destinationIata: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  status: FlightStatus;
}

export interface FogPrediction {
  predictionFor: string;
  probability: number;
  riskLevel: RiskLevel;
}

export interface Pnr {
  id: string;
  flightId: string;
  passengerName?: string;
  seatNumber?: string;
  pnrCode?: string;
  status: PnrStatus;
}

export interface Alternative {
  id: string;
  rank: number;
  type: AlternativeType;
  title: string;
  subtitle: string;
  durationMinutes: number;
  costEur: number;
  reliability: number;
  score: number;
  actionUrl: string;
  actionLabel: string;
}

/** Standard API error envelope (see docs/api-spec.md). */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
