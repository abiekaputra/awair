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

## Errors

- `422`: input is missing, unknown, or outside its range.
- `503`: no valid model artifact is available.
- `500`: inference failed unexpectedly; implementation details remain in server logs.

The service does not log prediction payloads. Production internet exposure requires authentication, transport security, and rate limiting at a trusted edge.
