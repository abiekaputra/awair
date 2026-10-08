# Mobile product

## User journey

1. The onboarding screen explains what AWAIR estimates and its synthetic-data limitation.
2. The prediction screen collects weather, time, traffic, and industrial context.
3. Client validation prevents incomplete or out-of-range values from reaching the API.
4. The API validates the request again, runs the model, persists the result, and returns one stable record.
5. The result screen presents AQI, category, six pollutants, and model version.
6. History and detail screens let the user inspect prior estimates.

## Reliability behavior

- Each submit action receives an idempotency key. A retry keeps the same key and input so a lost response cannot create duplicate history.
- Network requests time out after ten seconds and surface a user-readable error.
- History is cached with AsyncStorage after successful API reads and predictions.
- When the backend is unavailable, cached records remain available with an explicit offline banner.
- The client never silently substitutes cached data for a fresh prediction.

## Routes

| Route              | Responsibility                                  |
| ------------------ | ----------------------------------------------- |
| `/onboarding`      | First-use explanation and consent to continue   |
| `/(tabs)`          | Prediction input, validation, result, and retry |
| `/(tabs)/history`  | Recent API history with device-cache fallback   |
| `/prediction/[id]` | Inputs and outputs for one prediction           |
| `/(tabs)/about`    | Architecture, configuration, and product limits |

## Local configuration

`EXPO_PUBLIC_AWAIR_API_URL` selects the API used by the client. The default is `http://127.0.0.1:8000`, which suits the iOS simulator and web preview. Android emulators use `http://10.0.2.2:8000`; physical devices use the development computer's LAN address.

No API URL, secret, personal data, or production credential is committed to the repository.

## Current product boundary

Phase 5 implements the end-user flow without user accounts. Prediction history belongs to the one local AWAIR instance and is cached on one device. Identity, per-user ownership, real sensor inputs, health validation, and public hosting remain outside this local portfolio product.
