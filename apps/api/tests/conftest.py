"""Test configuration.

Force in-memory mode (no DB / external services) regardless of a local .env,
so the suite is hermetic and offline. Must run before app imports.
"""

import os

os.environ["DATABASE_URL"] = ""
os.environ["ENV"] = "development"
os.environ["DEBUG"] = "true"
os.environ["LIVE_FORECAST"] = "false"  # no network in tests
for _k in (
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "ORANGE_CLIENT_ID",
    "ORANGE_CLIENT_SECRET",
    "ORANGE_AUTH_HEADER",
):
    os.environ[_k] = ""
