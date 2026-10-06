# Testing and failure handling

## Quality gate

```bash
uv run python scripts/check_file_lengths.py
uv run ruff check .
uv run ruff format --check .
uv run pytest
```

The same commands run in GitHub Actions. Production Python files are limited to 400 lines and test files to 1,000 lines.

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

## Failure boundaries

Validation finishes before inference. A result is returned only after the history write succeeds, so the mobile client cannot receive an untraceable successful prediction. Model and storage availability failures return `503`; unexpected inference failures return a generic `500` while retaining details in server logs. Requests receive an `x-request-id` without their input values being logged.

SQLite transactions make each history insert atomic. An idempotency key has a unique database constraint, which protects against duplicate writes in addition to the service-level retry check.
