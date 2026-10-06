# Phase 4 validation record

Validated locally on 6 October 2026 without a public deployment.

## Automated gate

- source file limits passed;
- Ruff lint passed;
- Ruff formatting check passed;
- 22 pytest scenarios passed with 85% aggregate coverage;
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
