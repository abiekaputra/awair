# Testing and failure handling

## Quality gate

```bash
uv run python scripts/check_file_lengths.py
uv run ruff check .
uv run ruff format --check .
uv run pytest
cd mobile
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run export:web
pnpm run export:android
pnpm run export:ios
```

The same commands run in GitHub Actions. Production Python files are limited to 400 lines, other production code to 300 lines, and test files to 1,000 lines.

## Covered behavior

- deterministic synthetic data and the training data contract;
- chronological split, AQI-band weighting, baselines, and persisted model metadata;
- model artifact validation and bounded inference;
- health and combined model/database readiness;
- request schema ranges and rejection of unknown fields;
- prediction persistence, newest-first history, and detail retrieval;
- idempotent retries and conflicting key reuse;
- missing artifact, unavailable database, invalid history limit, and unknown record failures;
- Prometheus request and prediction metrics.
- browser-origin CORS behavior for the local Expo web client;
- mobile input conversion and validation boundaries;
- mobile API success, server-error, and network-error handling;
- history-cache deduplication, invalid-cache recovery, and onboarding persistence;
- result presentation and responsible-use disclaimer rendering.

Expo exports the web, Android, and iOS JavaScript bundles in CI. Bundle export validates route resolution, imports, assets, and platform-specific module availability without claiming that an emulator or physical-device interaction succeeded.

## Failure boundaries

Validation finishes before inference. A result is returned only after the history write succeeds, so the mobile client cannot receive an untraceable successful prediction. Model and storage availability failures return `503`; unexpected inference failures return a generic `500` while retaining details in server logs. Requests receive an `x-request-id` without their input values being logged.

SQLite transactions make each history insert atomic. An idempotency key has a unique database constraint, which protects against duplicate writes in addition to the service-level retry check.
