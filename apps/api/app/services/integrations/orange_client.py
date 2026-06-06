"""Orange CAMARA integration (Romania).

Available CAMARA products on the Orange Romania account:
  • SIM Swap   — has the SIM for this number been swapped recently? (ATO signal)
  • KYC Match  — does user-provided identity data match the operator's records?
(Number Verification is NOT available in RO, so login uses SMS OTP via Twilio.)

Paths default to the Romania **sandbox** (orange-lab) products — verified from
the Orange Developer docs — which use 2-legged OAuth and lab test numbers
(+4078910305x). Override ORANGE_SIM_SWAP_PATH / ORANGE_KYC_MATCH_PATH for
production (which uses 3-legged OAuth).

Feature-flagged: with no credentials every method returns None and callers
degrade gracefully.
"""

from __future__ import annotations

import base64
from typing import Any

import httpx
import structlog

from app.config import settings

logger = structlog.get_logger(__name__)

# Romania sandbox lab numbers + their fake identities (from Orange docs).
# Handy for demoing KYC Match (matching identity) without real data.
SANDBOX_IDENTITIES: dict[str, dict[str, str]] = {
    "+40789103050": {
        "name": "Andrei Mihai Popescu",
        "givenName": "Andrei",
        "familyName": "Popescu",
        "email": "andrei.popescu@example.com",
        "postalCode": "10607",
        "locality": "Bucuresti",
        "birthdate": "1985-03-14",
    },
    "+40789103051": {
        "name": "Ioana Elena Marinescu",
        "givenName": "Ioana",
        "familyName": "Marinescu",
        "email": "ioana.marinescu@example.com",
        "postalCode": "20145",
        "locality": "Bucuresti",
        "birthdate": "1990-11-02",
    },
    "+40789103052": {
        "name": "Catalin Andrei Iordache",
        "givenName": "Catalin",
        "familyName": "Iordache",
        "email": "catalin.iordache@example.com",
        "postalCode": "400114",
        "locality": "Cluj-Napoca",
        "birthdate": "1982-06-28",
    },
    "+40789103053": {
        "name": "Madalina Ioana Dobre",
        "givenName": "Madalina",
        "familyName": "Dobre",
        "email": "madalina.dobre@example.com",
        "postalCode": "700064",
        "locality": "Iasi",
        "birthdate": "1993-05-17",
    },
}


class OrangeClient:
    def __init__(self) -> None:
        self._token: str | None = None

    def _basic_header(self) -> str:
        # Prefer the portal's ready-made header; otherwise build it ourselves.
        if settings.ORANGE_AUTH_HEADER:
            return settings.ORANGE_AUTH_HEADER
        creds = f"{settings.ORANGE_CLIENT_ID}:{settings.ORANGE_CLIENT_SECRET}"
        return f"Basic {base64.b64encode(creds.encode()).decode()}"

    async def _get_token(self) -> str:
        if self._token:
            return self._token
        async with httpx.AsyncClient(base_url=settings.ORANGE_API_BASE) as http:
            resp = await http.post(
                settings.ORANGE_TOKEN_PATH,
                headers={"Authorization": self._basic_header()},
                data={"grant_type": "client_credentials"},
            )
            resp.raise_for_status()
            self._token = resp.json()["access_token"]
        return self._token

    async def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        if not settings.orange_enabled:
            return None
        try:
            token = await self._get_token()
            async with httpx.AsyncClient(base_url=settings.ORANGE_API_BASE) as http:
                resp = await http.post(
                    path,
                    headers={"Authorization": f"Bearer {token}"},
                    json=payload,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as exc:  # noqa: BLE001 - degrade gracefully
            logger.warning("orange_call_failed", path=path, error=str(exc))
            return None

    async def healthcheck(self) -> dict[str, Any]:
        """Verify creds + connectivity without exposing the token (dev only)."""
        if settings.ORANGE_MOCK:
            return {"enabled": True, "mock": True, "tokenOk": True}
        if not settings.orange_enabled:
            return {"enabled": False}
        try:
            await self._get_token()
            return {"enabled": True, "tokenOk": True}
        except Exception as exc:  # noqa: BLE001
            return {"enabled": True, "tokenOk": False, "error": str(exc)}

    async def check_sim_swap(
        self, phone_number: str, max_age_hours: int = 240
    ) -> bool | None:
        """True if the SIM was swapped within `max_age_hours`, else False.

        None when Orange is disabled/unavailable (caller treats as "no signal").
        """
        if settings.ORANGE_MOCK:
            # Lab numbers are documented as swapped ~1 day ago.
            return phone_number in SANDBOX_IDENTITIES
        body = await self._post(
            settings.ORANGE_SIM_SWAP_PATH,
            {"phoneNumber": phone_number, "maxAge": max_age_hours},
        )
        if body is None:
            return None
        return bool(body.get("swapped"))

    async def kyc_match(
        self, phone_number: str, applicant: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Match user-provided identity fields against operator records.

        `applicant` may include name/givenName/familyName/address/etc. Returns
        the per-field match result (values like "true"/"false"/"not_available"),
        or None when Orange is disabled/unavailable.
        """
        if settings.ORANGE_MOCK:
            identity = SANDBOX_IDENTITIES.get(phone_number)
            if not applicant:
                return {"overallMatch": "not_available"}
            return {
                f"{field}Match": (
                    "true" if identity and identity.get(field) == value else "false"
                )
                for field, value in applicant.items()
            }
        return await self._post(
            settings.ORANGE_KYC_MATCH_PATH,
            {"phoneNumber": phone_number, **applicant},
        )

    async def device_reachability(self, phone_number: str) -> dict[str, Any] | None:
        """How the device is reachable right now — used to pick the best channel.

        Returns {"reachable": bool, "data": bool, "sms": bool, "status": str}, or
        None when Orange is disabled/unavailable (caller keeps its defaults).
        """
        if settings.ORANGE_MOCK:
            return {"reachable": True, "data": True, "sms": True, "status": "CONNECTED_DATA"}
        body = await self._post(
            settings.ORANGE_REACHABILITY_PATH,
            {"device": {"phoneNumber": phone_number}},
        )
        if body is None:
            return None
        # CAMARA returns connectivityStatus / reachabilityStatus like
        # CONNECTED_DATA | CONNECTED_SMS | NOT_CONNECTED, or a list of types.
        status = str(
            body.get("reachabilityStatus") or body.get("connectivityStatus") or ""
        ).upper()
        types = {str(t).upper() for t in (body.get("reachabilityType") or [])}
        data = status == "CONNECTED_DATA" or "DATA" in types or bool(body.get("data"))
        sms = status in ("CONNECTED_DATA", "CONNECTED_SMS") or "SMS" in types or bool(body.get("sms"))
        return {
            "reachable": status != "NOT_CONNECTED" and (data or sms),
            "data": data,
            "sms": sms,
            "status": status or ("CONNECTED" if (data or sms) else "UNKNOWN"),
        }

    async def verify_location(
        self, phone_number: str, lat: float, lon: float, radius_m: int = 5000
    ) -> dict[str, Any] | None:
        """Is the device within `radius_m` of (lat, lon)? (geofencing-style check)

        Returns {"within": bool, "result": str, "matchRate": int|None}, or None
        when Orange is disabled/unavailable.
        """
        if settings.ORANGE_MOCK:
            return {"within": phone_number in SANDBOX_IDENTITIES, "result": "TRUE", "matchRate": 95}
        body = await self._post(
            settings.ORANGE_LOCATION_VERIFY_PATH,
            {
                "device": {"phoneNumber": phone_number},
                "area": {
                    "areaType": "CIRCLE",
                    "center": {"latitude": lat, "longitude": lon},
                    "radius": radius_m,
                },
            },
        )
        if body is None:
            return None
        result = str(body.get("verificationResult") or "").upper()
        return {
            "within": result in ("TRUE", "PARTIAL"),
            "result": result or "UNKNOWN",
            "matchRate": body.get("matchRate"),
        }


orange_client = OrangeClient()
