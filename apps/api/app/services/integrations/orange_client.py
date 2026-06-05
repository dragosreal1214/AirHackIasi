"""Orange CAMARA integration (Romania).

Available CAMARA products on the Orange Romania account:
  • SIM Swap   — has the SIM for this number been swapped recently? (ATO signal)
  • KYC Match  — does user-provided identity data match the operator's records?
(Number Verification is NOT available in RO, so login uses SMS OTP via Twilio.)

OAuth2 client_credentials is used for all calls. Feature-flagged: with no
credentials every method returns None and callers degrade gracefully.

⚠️ ENDPOINT PATHS / FIELD NAMES BELOW ARE BEST-EFFORT CAMARA DEFAULTS. Confirm
the exact product paths + versions shown on the Orange Developer portal for
Romania and adjust the constants if they differ.
"""

from __future__ import annotations

import base64
from typing import Any

import httpx
import structlog

from app.config import settings

logger = structlog.get_logger(__name__)

# TODO(orange): confirm exact product paths/versions on Orange Developer (RO).
SIM_SWAP_CHECK_PATH = "/camara/sim-swap/v040/check"
KYC_MATCH_PATH = "/camara/kyc-match/v020/match"


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

    async def check_sim_swap(
        self, phone_number: str, max_age_hours: int = 240
    ) -> bool | None:
        """True if the SIM was swapped within `max_age_hours`, else False.

        None when Orange is disabled/unavailable (caller treats as "no signal").
        """
        body = await self._post(
            SIM_SWAP_CHECK_PATH,
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
        return await self._post(
            KYC_MATCH_PATH,
            {"phoneNumber": phone_number, **applicant},
        )


orange_client = OrangeClient()
