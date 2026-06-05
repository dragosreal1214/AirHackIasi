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

/** Compact flight shape used across passenger screens. */
export interface FlightSummary {
  id: string;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  scheduledDeparture: string; // ISO 8601
  scheduledArrival: string; // ISO 8601
  status: FlightStatus;
}

/** Current fog risk attached to a flight's origin airport. */
export interface CurrentRisk {
  level: RiskLevel;
  probability: number; // 0..1
  predictionFor: string; // ISO 8601
  fogWindow?: { start: string; end: string };
  explanation?: string; // ML "why", Romanian
}

export interface FogPrediction {
  predictionFor: string;
  probability: number;
  riskLevel: RiskLevel;
}

/** A passenger's saved flight (PNR) enriched with its flight + current risk. */
export interface PnrWithFlight {
  id: string;
  status: PnrStatus;
  passengerName?: string;
  seatNumber?: string;
  pnrCode?: string;
  flight: FlightSummary;
  currentRisk: CurrentRisk | null;
  /** Set when an active disruption exists for this flight. */
  disruptionId: string | null;
}

/** A detected disruption (origin fog risk threatens a flight). */
export interface Disruption {
  id: string;
  flight: FlightSummary;
  severity: RiskLevel;
  risk: CurrentRisk;
  detectedAt: string; // ISO 8601
  alternativesCount: number;
}

export interface Alternative {
  id: string;
  rank: number;
  type: AlternativeType;
  title: string;
  subtitle: string;
  departure: string; // ISO 8601
  arrival: string; // ISO 8601
  durationMinutes: number;
  costEur: number;
  reliability: number; // 0..1
  score: number; // 0..100
  actionUrl: string;
  actionLabel: string;
}

/** Request body for creating a PNR. */
export interface CreatePnrInput {
  flightId: string;
  passengerName?: string;
  seatNumber?: string;
  pnrCode?: string;
}

/** Standard API error envelope (see docs/api-spec.md). */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ----- Auth -----

export type AuthMethod = "sms_otp" | "dev";

export interface PhoneStartResponse {
  challengeId: string;
  method: AuthMethod;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
