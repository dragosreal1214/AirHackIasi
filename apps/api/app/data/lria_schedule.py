"""LRIA (Iași) weekly flight schedule — from the official 01–07 June 2026 timetable.

Encoded as daily-recurring entries (the core network repeats each day). Each
entry is expanded to a concrete flight for a chosen date by flight_service.

dir: "D" = departs Iași (IAS -> other), "A" = arrives Iași (other -> IAS).
Flight time is local (Europe/Bucharest, EEST +03:00 in June). Airline code is
the first two chars of the flight number.
"""

from __future__ import annotations

AIRLINE_NAMES = {
    "W4": "Wizz Air",
    "RO": "TAROM",
    "FR": "Ryanair",
    "OS": "Austrian Airlines",
    "A2": "Animawings",
    "H4": "HiSky",
    "U5": "SkyUp",
    "XC": "Corendon",
    "GQ": "Sky Express",
}

# (flight_number, direction, other_iata, local_time "HH:MM")
WEEKLY: list[tuple[str, str, str, str]] = [
    # ---- Departures from Iași ----
    ("W43661", "D", "CRL", "05:10"),
    ("OS706", "D", "VIE", "05:20"),
    ("RO710", "D", "OTP", "05:25"),
    ("W43663", "D", "BVA", "05:45"),
    ("W43671", "D", "BGY", "06:00"),
    ("W43651", "D", "LTN", "06:10"),
    ("RO702", "D", "OTP", "07:50"),
    ("A2131", "D", "OTP", "08:30"),
    ("FR3115", "D", "BVA", "10:55"),
    ("W43695", "D", "BLL", "12:05"),
    ("W43659", "D", "EIN", "12:05"),
    ("W43675", "D", "FCO", "12:15"),
    ("W43655", "D", "DTM", "12:10"),
    ("FR9583", "D", "DUB", "12:25"),
    ("W43639", "D", "BSL", "12:30"),
    ("W43669", "D", "TSF", "13:20"),
    ("W43705", "D", "PRG", "13:30"),
    ("W43691", "D", "MAD", "14:20"),
    ("RO704", "D", "OTP", "14:25"),
    ("W43685", "D", "BCN", "14:40"),
    ("W43717", "D", "SAW", "14:15"),
    ("OS704", "D", "VIE", "16:00"),
    ("W43727", "D", "PSA", "17:35"),
    ("FR3113", "D", "BGY", "17:50"),
    ("W43637", "D", "FMM", "18:20"),
    ("W43723", "D", "VLC", "18:40"),
    ("W43697", "D", "LPL", "18:40"),
    ("W43653", "D", "LTN", "18:50"),
    ("W43667", "D", "BLQ", "18:55"),
    ("W43701", "D", "MXP", "19:00"),
    ("W43693", "D", "LCA", "19:05"),
    ("W43677", "D", "TRN", "20:05"),
    ("RO708", "D", "OTP", "22:35"),
    # ---- Arrivals into Iași ----
    ("A2130", "A", "OTP", "07:45"),
    ("RO701", "A", "OTP", "08:30"),
    ("FR3114", "A", "BVA", "09:35"),
    ("W43662", "A", "CRL", "11:10"),
    ("W43672", "A", "BGY", "11:20"),
    ("W43664", "A", "BVA", "12:30"),
    ("W43652", "A", "LTN", "13:30"),
    ("RO703", "A", "OTP", "14:00"),
    ("OS703", "A", "VIE", "15:20"),
    ("W43676", "A", "FCO", "17:50"),
    ("W43670", "A", "TSF", "18:10"),
    ("W43656", "A", "DTM", "17:50"),
    ("W43660", "A", "EIN", "18:05"),
    ("W43706", "A", "PRG", "17:45"),
    ("W43686", "A", "BCN", "22:10"),
    ("W43692", "A", "MAD", "23:10"),
    ("W43668", "A", "BLQ", "23:55"),
    ("W43678", "A", "TRN", "00:45"),
    ("W43638", "A", "FMM", "23:25"),
    ("W43698", "A", "LPL", "02:15"),
    ("W43702", "A", "MXP", "00:25"),
    ("W43694", "A", "LCA", "00:55"),
    ("W43718", "A", "SAW", "18:15"),
    ("RO707", "A", "OTP", "19:30"),
    ("H4244", "A", "DUB", "15:10"),
]


def airline_name(flight_number: str) -> str:
    return AIRLINE_NAMES.get(flight_number[:2], flight_number[:2])
