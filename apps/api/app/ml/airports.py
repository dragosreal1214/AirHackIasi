"""Airport registry for fog forecasting.

The fog model uses generic meteorological features, so the LRIA-trained model
generalises to any airport given that airport's weather (from Open-Meteo).
This registry covers Iași (LRIA, home) and every destination it serves —
derived from the official LRIA weekly schedule (01–07 June 2026).
"""

from __future__ import annotations

from typing import NamedTuple


class Airport(NamedTuple):
    iata: str
    name: str
    city: str
    country: str
    lat: float
    lon: float


HOME = "IAS"

AIRPORTS: dict[str, Airport] = {
    # --- Home + Romania ---
    "IAS": Airport("IAS", "Iași International", "Iași", "RO", 47.1785, 27.6206),
    "OTP": Airport("OTP", "Henri Coandă", "București", "RO", 44.5711, 26.0850),
    "CLJ": Airport("CLJ", "Avram Iancu", "Cluj-Napoca", "RO", 46.7852, 23.6862),
    "SCV": Airport("SCV", "Ștefan cel Mare", "Suceava", "RO", 47.6875, 26.3540),
    "BCM": Airport("BCM", "George Enescu", "Bacău", "RO", 46.5219, 26.9103),
    # --- Western / Central Europe ---
    "LTN": Airport("LTN", "London Luton", "Londra", "GB", 51.8747, -0.3683),
    "LPL": Airport("LPL", "Liverpool John Lennon", "Liverpool", "GB", 53.3336, -2.8497),
    "DUB": Airport("DUB", "Dublin", "Dublin", "IE", 53.4213, -6.2701),
    "BVA": Airport("BVA", "Paris-Beauvais", "Paris", "FR", 49.4544, 2.1128),
    "CRL": Airport("CRL", "Brussels South Charleroi", "Charleroi", "BE", 50.4592, 4.4538),
    "EIN": Airport("EIN", "Eindhoven", "Eindhoven", "NL", 51.4501, 5.3745),
    "BSL": Airport("BSL", "EuroAirport Basel", "Basel", "CH", 47.5896, 7.5299),
    "DTM": Airport("DTM", "Dortmund", "Dortmund", "DE", 51.5183, 7.6122),
    "FMM": Airport("FMM", "Memmingen", "Memmingen", "DE", 47.9888, 10.2395),
    "VIE": Airport("VIE", "Wien-Schwechat", "Viena", "AT", 48.1103, 16.5697),
    "PRG": Airport("PRG", "Václav Havel", "Praga", "CZ", 50.1008, 14.26),
    "BLL": Airport("BLL", "Billund", "Billund", "DK", 55.7403, 9.1518),
    # --- Italy ---
    "BGY": Airport("BGY", "Milano Bergamo", "Bergamo", "IT", 45.6739, 9.7042),
    "MXP": Airport("MXP", "Milano Malpensa", "Milano", "IT", 45.6306, 8.7281),
    "BLQ": Airport("BLQ", "Bologna Guglielmo Marconi", "Bologna", "IT", 44.5354, 11.2887),
    "TRN": Airport("TRN", "Torino Caselle", "Torino", "IT", 45.2008, 7.6496),
    "FCO": Airport("FCO", "Roma Fiumicino", "Roma", "IT", 41.8003, 12.2389),
    "TSF": Airport("TSF", "Treviso", "Veneția", "IT", 45.6484, 12.1944),
    "PSA": Airport("PSA", "Pisa", "Pisa", "IT", 43.6839, 10.3927),
    # --- Iberia ---
    "BCN": Airport("BCN", "Barcelona El Prat", "Barcelona", "ES", 41.2974, 2.0833),
    "MAD": Airport("MAD", "Madrid Barajas", "Madrid", "ES", 40.4719, -3.5626),
    "VLC": Airport("VLC", "Valencia", "Valencia", "ES", 39.4893, -0.4816),
    "PMI": Airport("PMI", "Palma de Mallorca", "Palma", "ES", 39.5517, 2.7388),
    # --- Greece / Cyprus / Turkey / Egypt ---
    "SKG": Airport("SKG", "Thessaloniki", "Salonic", "GR", 40.5197, 22.9709),
    "HER": Airport("HER", "Heraklion", "Heraklion", "GR", 35.3397, 25.1803),
    "RHO": Airport("RHO", "Rhodes", "Rodos", "GR", 36.4054, 28.0862),
    "LCA": Airport("LCA", "Larnaca", "Larnaca", "CY", 34.8751, 33.6249),
    "SAW": Airport("SAW", "Istanbul Sabiha Gökçen", "Istanbul", "TR", 40.8986, 29.3092),
    "AYT": Airport("AYT", "Antalya", "Antalya", "TR", 36.8987, 30.8005),
    "HRG": Airport("HRG", "Hurghada", "Hurghada", "EG", 27.1783, 33.7994),
}


def get(iata: str) -> Airport | None:
    return AIRPORTS.get(iata.upper())
