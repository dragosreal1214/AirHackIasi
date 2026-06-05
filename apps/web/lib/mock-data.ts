/**
 * In-memory mock data for local development.
 *
 * Active while no backend is configured (see `lib/api.ts`). The shapes match
 * `@aerly/shared`, so swapping to the real FastAPI API is a drop-in change.
 * Times are computed relative to "now" so the demo always looks current.
 */

import type {
  Alternative,
  Disruption,
  FlightSummary,
  PnrWithFlight,
} from "@aerly/shared";

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

const FLIGHT_RO632: FlightSummary = {
  id: "fl_ro632",
  flightNumber: "RO 632",
  airlineCode: "RO",
  airlineName: "TAROM",
  originIata: "IAS",
  originCity: "Iași",
  destinationIata: "OTP",
  destinationCity: "București",
  scheduledDeparture: hoursFromNow(4.5),
  scheduledArrival: hoursFromNow(5.5),
  status: "scheduled",
};

const FLIGHT_W6201: FlightSummary = {
  id: "fl_w6201",
  flightNumber: "W6 3201",
  airlineCode: "W6",
  airlineName: "Wizz Air",
  originIata: "IAS",
  originCity: "Iași",
  destinationIata: "LTN",
  destinationCity: "Londra",
  scheduledDeparture: hoursFromNow(28),
  scheduledArrival: hoursFromNow(32),
  status: "scheduled",
};

const FLIGHT_RO634: FlightSummary = {
  id: "fl_ro634",
  flightNumber: "RO 634",
  airlineCode: "RO",
  airlineName: "TAROM",
  originIata: "IAS",
  originCity: "Iași",
  destinationIata: "OTP",
  destinationCity: "București",
  scheduledDeparture: hoursFromNow(9),
  scheduledArrival: hoursFromNow(10),
  status: "scheduled",
};

/** Catalog used by flight search (a passenger adds flights from here). */
export const FLIGHT_CATALOG: FlightSummary[] = [
  FLIGHT_RO632,
  FLIGHT_W6201,
  FLIGHT_RO634,
  {
    id: "fl_a9101",
    flightNumber: "A9 101",
    airlineCode: "A9",
    airlineName: "Animawings",
    originIata: "IAS",
    originCity: "Iași",
    destinationIata: "BCN",
    destinationCity: "Barcelona",
    scheduledDeparture: hoursFromNow(50),
    scheduledArrival: hoursFromNow(54),
    status: "scheduled",
  },
];

export const DISRUPTIONS: Record<string, Disruption> = {
  d_001: {
    id: "d_001",
    flight: FLIGHT_RO632,
    severity: "high",
    risk: {
      level: "high",
      probability: 0.78,
      predictionFor: FLIGHT_RO632.scheduledDeparture,
      fogWindow: { start: hoursFromNow(3), end: hoursFromNow(6) },
    },
    detectedAt: hoursFromNow(-0.5),
    alternativesCount: 4,
  },
};

export const ALTERNATIVES: Record<string, Alternative[]> = {
  d_001: [
    {
      id: "alt_train_ir",
      rank: 1,
      type: "train",
      title: "Tren IR 1654 · Iași → București Nord",
      subtitle: "Direct, fără transfer aeroport",
      departure: hoursFromNow(2),
      arrival: hoursFromNow(8),
      durationMinutes: 360,
      costEur: 28,
      reliability: 0.92,
      score: 88,
      actionUrl: "https://bilete.cfrcalatori.ro/",
      actionLabel: "Rezervă pe CFR",
    },
    {
      id: "alt_flight_ro634",
      rank: 2,
      type: "alternate_flight",
      title: "TAROM RO 634 · IAS → OTP",
      subtitle: "Mai târziu azi, risc de ceață mai mic",
      departure: hoursFromNow(9),
      arrival: hoursFromNow(10),
      durationMinutes: 60,
      costEur: 95,
      reliability: 0.85,
      score: 79,
      actionUrl: "https://www.tarom.ro/",
      actionLabel: "Rezervă pe TAROM",
    },
    {
      id: "alt_reroute_bcm",
      rank: 3,
      type: "reroute_airport",
      title: "Reroute via Bacău (BCM)",
      subtitle: "Transfer auto ~1h 40min + zbor către OTP",
      departure: hoursFromNow(6),
      arrival: hoursFromNow(8),
      durationMinutes: 220,
      costEur: 140,
      reliability: 0.74,
      score: 61,
      actionUrl: "https://www.aerodatabox.com/",
      actionLabel: "Vezi detalii",
    },
    {
      id: "alt_bus_flix",
      rank: 4,
      type: "bus",
      title: "FlixBus · Iași → București",
      subtitle: "Plecare din centru, fără transfer aeroport",
      departure: hoursFromNow(3),
      arrival: hoursFromNow(11),
      durationMinutes: 480,
      costEur: 22,
      reliability: 0.78,
      score: 58,
      actionUrl: "https://www.flixbus.ro/",
      actionLabel: "Rezervă pe FlixBus",
    },
  ],
};

/** Mutable session store of the passenger's saved flights. */
export const PNR_STORE: PnrWithFlight[] = [
  {
    id: "pnr_001",
    status: "active",
    passengerName: "Andrei Pop",
    pnrCode: "XR7K2A",
    flight: FLIGHT_RO632,
    currentRisk: DISRUPTIONS.d_001.risk,
    disruptionId: "d_001",
  },
  {
    id: "pnr_002",
    status: "active",
    passengerName: "Andrei Pop",
    pnrCode: "QW91ZB",
    flight: FLIGHT_W6201,
    currentRisk: {
      level: "low",
      probability: 0.08,
      predictionFor: FLIGHT_W6201.scheduledDeparture,
    },
    disruptionId: null,
  },
];

let pnrSeq = PNR_STORE.length;

export function nextPnrId(): string {
  pnrSeq += 1;
  return `pnr_${String(pnrSeq).padStart(3, "0")}`;
}
