"""Static train/bus options for the alternatives engine.

Keyed by an unordered city pair. Times are offsets from the disrupted flight's
scheduled departure; durations/prices are representative. Real-time CFR/FlixBus
APIs would replace this, but the routes/durations here are realistic.
"""

from __future__ import annotations


def _key(a: str, b: str) -> frozenset[str]:
    return frozenset({a, b})


# option: provider, number, depart_offset_min, duration_min, price_eur, reliability, url
TRAIN_ROUTES: dict[frozenset[str], list[dict]] = {
    _key("Iași", "București"): [
        {"provider": "CFR", "number": "IR 1654", "offset": -30, "duration": 380, "price": 28, "reliability": 0.92, "url": "https://bilete.cfrcalatori.ro/"},
        {"provider": "CFR", "number": "IR 1746", "offset": 120, "duration": 400, "price": 26, "reliability": 0.9, "url": "https://bilete.cfrcalatori.ro/"},
    ],
    _key("Iași", "Cluj-Napoca"): [
        {"provider": "CFR", "number": "IR 1834", "offset": -30, "duration": 420, "price": 24, "reliability": 0.9, "url": "https://bilete.cfrcalatori.ro/"},
    ],
    _key("Iași", "Suceava"): [
        {"provider": "CFR", "number": "IR 1641", "offset": 0, "duration": 120, "price": 9, "reliability": 0.93, "url": "https://bilete.cfrcalatori.ro/"},
    ],
}

BUS_ROUTES: dict[frozenset[str], list[dict]] = {
    _key("Iași", "București"): [
        {"provider": "FlixBus", "number": "N1720", "offset": 30, "duration": 480, "price": 22, "reliability": 0.78, "url": "https://www.flixbus.ro/"},
    ],
    _key("Iași", "Cluj-Napoca"): [
        {"provider": "FlixBus", "number": "N1812", "offset": 0, "duration": 390, "price": 20, "reliability": 0.78, "url": "https://www.flixbus.ro/"},
    ],
    _key("Iași", "Chișinău"): [
        {"provider": "FlixBus", "number": "N940", "offset": 30, "duration": 180, "price": 14, "reliability": 0.8, "url": "https://www.flixbus.ro/"},
    ],
}


def trains(city_a: str, city_b: str) -> list[dict]:
    return TRAIN_ROUTES.get(_key(city_a, city_b), [])


def buses(city_a: str, city_b: str) -> list[dict]:
    return BUS_ROUTES.get(_key(city_a, city_b), [])
