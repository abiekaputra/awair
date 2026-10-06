# API contract

## `POST /predict`

Request:

```json
{
  "temperature_c": 30,
  "humidity_pct": 70,
  "wind_speed_mps": 2.5,
  "hour": 8,
  "traffic_index": 0.8,
  "industrial_index": 0.4
}
```

Response:

```json
{
  "id": "4095f43f-7134-4c13-a265-827706346aba",
  "created_at": "2026-10-06T02:00:00+00:00",
  "inputs": {
    "temperature_c": 30,
    "humidity_pct": 70,
    "wind_speed_mps": 2.5,
    "hour": 8,
    "traffic_index": 0.8,
    "industrial_index": 0.4
  },
  "pollutants": {
    "pm25": 62.1,
    "pm10": 91.2,
    "no2": 55.4,
    "so2": 18.3,
    "co": 2.1,
    "o3": 31.7
  },
  "aqi": 137.5,
  "category": "Unhealthy for Sensitive Groups",
  "model_version": "20261006T000000Z"
}
```

The numbers above illustrate the schema and are not a guaranteed model result.

Send a unique `Idempotency-Key` header for each user action. A retry with the same key and input returns the original record instead of adding another history item.

## `GET /predictions?limit=20`

Returns `{ "items": [...] }` with the newest persisted predictions first. `limit` accepts values from 1 through 100.

## `GET /predictions/{id}`

Returns one prediction using the same response schema as `POST /predict`. An unknown identifier returns `404`.

## Errors

- `422`: input is missing, unknown, or outside its range.
- `409`: an idempotency key was reused with different input.
- `503`: the model artifact or local prediction database is unavailable.
- `500`: inference failed unexpectedly; implementation details remain in server logs.

The service does not log prediction payloads. Production internet exposure requires authentication, transport security, and rate limiting at a trusted edge.
