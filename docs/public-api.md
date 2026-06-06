# Fogora — Public Fog Predictor API

Predict airport fog from weather features, using the same XGBoost model that
powers Fogora (trained on ~2 years of METAR at Iași / LRIA, ROC-AUC ≈ 0.99).

- **Base URL:** `https://<your-api-host>/api/public/v1`
- **Format:** JSON. **Auth:** `X-API-Key` header (open/key-less until keys are configured).
- **Rate limit:** 60 requests/minute per IP (configurable).
- **Interactive docs:** `https://<your-api-host>/docs` (OpenAPI / Swagger) and `/redoc`.

## Authentication

```
X-API-Key: <your-key>
```

If the operator has configured `PUBLIC_API_KEYS`, a valid key is required (else
`401 INVALID_API_KEY`). With no keys configured the API is open (still rate-limited).

## Endpoints

### `GET /predict` — fog probability from weather features
Query params (all required):

| param | type | meaning |
|---|---|---|
| `temperature` | float | air temperature, °C |
| `dewpoint_depression` | float | temperature − dew point, °C (0 ≈ saturated) |
| `wind_speed` | float | wind speed, knots |
| `humidity` | float | relative humidity, % (0–100) |
| `hour` | int | local hour, 0–23 |
| `month` | int | month, 1–12 |

```bash
curl -H "X-API-Key: demo" \
  "https://<host>/api/public/v1/predict?temperature=2&dewpoint_depression=0&wind_speed=2&humidity=100&hour=5&month=12"
```
```json
{
  "probability": 0.8859,
  "level": "high",
  "explanation": "89% risc de ceață — diferență minimă temp/punct de rouă (0.0°C) + umiditate extremă (100%) …",
  "usingFallback": false
}
```

### `POST /predict/batch` — up to 100 rows
```bash
curl -X POST -H "Content-Type: application/json" -H "X-API-Key: demo" \
  -d '[{"temperature":2,"dewpointDepression":0,"windSpeed":2,"humidity":100,"hour":5,"month":12}]' \
  "https://<host>/api/public/v1/predict/batch"
```
Returns a JSON array of predictions in the same order.

### `GET /forecast?airport=IAS` — live hourly fog-risk timeline
Open-Meteo forecast scored by the model. Returns `{ source, available, airport,
hourly[], windows[], peak }` where each hourly point has `time, probability,
level` and the weather features used.

### `GET /airports/{iata}/risk` — B2B per-flight risk board
Fog risk for **every scheduled flight at an airport** on a date — for airlines /
airport ops. Per-flight risk is the fog risk at that flight's **departure** airport.

| param | type | meaning |
|---|---|---|
| `iata` | path | airport IATA (e.g. `IAS`) |
| `date` | query | `YYYY-MM-DD` (default: today) |
| `direction` | query | `departures` (default) · `arrivals` · `all` |

```bash
curl -H "X-API-Key: demo" \
  "https://<host>/api/public/v1/airports/IAS/risk?direction=departures&date=2026-06-09"
```
```json
{
  "airport": { "iata": "IAS", "name": "Iași International", "city": "Iași", "country": "RO" },
  "date": "2026-06-09",
  "direction": "departures",
  "airportFogRisk": { "level": "high", "probability": 0.88, "predictionFor": "..." },
  "summary": { "total": 33, "atRisk": 2 },
  "flights": [
    {
      "flightNumber": "RO 702", "airlineCode": "RO", "airlineName": "TAROM",
      "originIata": "IAS", "destinationIata": "OTP",
      "scheduledDeparture": "2026-06-09T07:50:00+03:00",
      "scheduledArrival": "2026-06-09T09:50:00+03:00",
      "riskLevel": "high", "riskProbability": 0.88, "atRisk": true
    }
  ]
}
```
`flights` is sorted by risk (highest first). `summary.atRisk` counts high/critical.

### `GET /airports` — supported airports
`[{ iata, name, city, country, lat, lon }]`

### `GET /model` — model metadata
Feature order, level thresholds, training summary, metrics.

## Risk levels

| level | probability |
|---|---|
| `low` | `< 0.25` |
| `moderate` | `0.25 – 0.55` |
| `high` | `0.55 – 0.90` |
| `critical` | `≥ 0.90` |

## Examples

**Python**
```python
import requests
r = requests.get("https://<host>/api/public/v1/predict",
    params={"temperature":2,"dewpoint_depression":0,"wind_speed":2,
            "humidity":100,"hour":5,"month":12},
    headers={"X-API-Key":"demo"})
print(r.json()["probability"], r.json()["level"])
```

**JavaScript**
```js
const p = new URLSearchParams({ temperature:2, dewpoint_depression:0, wind_speed:2,
  humidity:100, hour:5, month:12 });
const res = await fetch(`https://<host>/api/public/v1/predict?${p}`,
  { headers: { "X-API-Key": "demo" } });
console.log(await res.json());
```

## Errors
Standard envelope: `{ "detail": { "code": "...", "message": "..." } }`.
`401 INVALID_API_KEY`, `404 AIRPORT_NOT_FOUND`, `429` (rate limit), `422` (bad params).

## Notes
- The model generalises across airports (it uses generic meteorological features),
  so `/predict` works for any location's weather, not just Iași.
- `explanation` is Romanian. `usingFallback: true` means the rule-based estimate
  was used (model file unavailable).
