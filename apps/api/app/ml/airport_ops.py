"""Low-visibility landing capability per airport (ILS category).

Why this matters: fog only disrupts a flight if the airport *can't* land in it.
Iași (LRIA) is **CAT I** (min RVR ~550 m, decision height 200 ft) — which is
exactly why fog there grounds departures. Most of our destinations are **CAT III**
(autoland in dense fog, RVR down to ~75 m), so fog at the destination rarely
causes a diversion. We use the destination's category to discount its fog into a
real *landing-disruption* risk.

Sources (researched=True): airport AIPs / operator briefings / Wikipedia.
Iași CAT I, Bucharest OTP CAT IIIB, Barcelona CAT II/III, Bergamo/Malpensa/
Madrid/Vienna/Bologna CAT IIIB, Luton CAT IIIA. Others are estimated by the
airport's role (major hub → CAT III, regional → CAT II, small/leisure → CAT I)
and flagged researched=False.
"""

from __future__ import annotations

# How strongly a category neutralises fog as a disruptor (0..1).
_MITIGATION = {
    "CAT IIIB": 0.92,
    "CAT IIIA": 0.85,
    "CAT III": 0.88,
    "CAT II": 0.55,
    "CAT I": 0.15,
    None: 0.0,
}
# Lowest runway visual range each category can operate to (metres).
_MIN_RVR_M = {"CAT IIIB": 75, "CAT IIIA": 200, "CAT III": 150, "CAT II": 300, "CAT I": 550}

# iata -> (category, researched)
_ILS: dict[str, tuple[str, bool]] = {
    # --- researched ---
    "IAS": ("CAT I", True),      # RVR 550 m, DH 200 ft; CAT II lighting only — the bottleneck
    "OTP": ("CAT IIIB", True),   # 08L/08R CAT III, autoland below RVR 350 m
    "BCN": ("CAT III", True),    # 24L/06R + 3rd rwy CAT II/III, usable in fog
    "BGY": ("CAT IIIB", True),
    "MXP": ("CAT IIIB", True),
    "MAD": ("CAT IIIB", True),
    "VIE": ("CAT IIIB", True),
    "BLQ": ("CAT IIIB", True),
    "LTN": ("CAT IIIA", True),
    # --- estimated: major hubs (fog-capable) ---
    "FCO": ("CAT IIIB", False),
    "PRG": ("CAT IIIB", False),
    "DUB": ("CAT III", False),
    "BSL": ("CAT III", False),
    "CRL": ("CAT III", False),
    "BVA": ("CAT II", False),
    # --- estimated: regional ---
    "TRN": ("CAT II", False),
    "PSA": ("CAT II", False),
    "EIN": ("CAT III", False),
    "DTM": ("CAT I", False),
    "BLL": ("CAT II", False),
    "TSF": ("CAT II", False),
    "VLC": ("CAT II", False),
    "LPL": ("CAT II", False),
    "CLJ": ("CAT II", False),
    # --- estimated: small / leisure (fog rare anyway) ---
    "SCV": ("CAT I", False),
    "BCM": ("CAT I", False),
    "FMM": ("CAT I", False),
    "PMI": ("CAT I", False),
    "SKG": ("CAT I", False),
    "HER": ("CAT I", False),
    "RHO": ("CAT I", False),
    "LCA": ("CAT II", False),
    "SAW": ("CAT III", False),
    "AYT": ("CAT II", False),
    "HRG": ("CAT I", False),
}

_DEFAULT = ("CAT I", False)


def capability(iata: str) -> dict:
    cat, researched = _ILS.get(iata, _DEFAULT)
    return {
        "category": cat,
        "researched": researched,
        "mitigation": _MITIGATION[cat],
        "min_rvr_m": _MIN_RVR_M.get(cat),
        "autoland": cat in ("CAT IIIA", "CAT IIIB", "CAT III"),
    }
