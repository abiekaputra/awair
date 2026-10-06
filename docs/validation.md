# Phase 5 validation record

Validated locally on 6 October 2026 without a public deployment.

## Automated gate

- source file limits passed;
- Ruff lint passed;
- Ruff formatting check passed;
- 23 backend pytest scenarios passed;
- 11 mobile Jest scenarios passed across four suites;
- mobile ESLint and TypeScript checks passed;
- Expo produced all ten static web routes successfully;
- clean model and database fixtures were used by the integration tests.
- `pip-audit` found no known vulnerabilities in the locked third-party dependencies.

## HTTP flow

The service was started with the committed model artifact and a new temporary SQLite path. The following real HTTP sequence completed successfully:

1. `GET /ready` reported both the model and database ready.
2. `POST /predict` accepted validated context with an idempotency key.
3. The response included a UUID, UTC creation time, original input, six pollutants, AQI, category, and model version.
4. `GET /predictions?limit=1` returned the same persisted record.
5. Structured logs contained request IDs, routes, status, and duration without prediction payloads.

The validated sample produced AQI `106.59`, categorized as `Unhealthy for Sensitive Groups`, using model version `20261005T235707Z`. This is an illustrative synthetic-model result, not a health claim.

## Mobile flow

The Expo web target was used as the locally available runtime for the same React Native screen tree. The following user-visible sequence completed against a real local API:

1. onboarding opened and continued to the prediction form;
2. the default valid form submitted through `POST /predict`;
3. the result displayed AQI `69.93`, category `Moderate`, six pollutants, and model version `20261005T235707Z`;
4. history listed the persisted record and detail displayed its original inputs;
5. after the API was stopped, history still displayed the cached record with explicit cached-data and connection-error messages;
6. the about screen displayed the product architecture, active API address, and responsible-use boundary.

Native Android and iOS packaging remain build-target validation for Phase 6 because this workstation does not currently have the Android SDK or full Xcode simulator runtime. The Expo application uses the same TypeScript implementation across native and web targets.

The production-dependency audit resolved available `uuid` and `decode-uri-component` fixes through lockfile overrides. Three upstream Expo/React Native tooling advisories remain documented in [the security policy](../SECURITY.md) because the registry has not published the patched versions named by their advisories.
