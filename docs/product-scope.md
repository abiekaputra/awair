# Product scope and Phase 5 acceptance criteria

## Product definition

AWAIR supports a mobile user who provides current weather and activity context, receives an illustrative AQI and pollutant estimate, and can revisit prior results. The default model uses synthetic data, so the result is engineering evidence rather than health guidance.

## Product flow

```mermaid
flowchart LR
    User[Mobile user] --> Input[Validated context]
    Input --> API[Local API]
    API --> Service[Prediction service]
    Service --> Model[Versioned two-stage model]
    Model --> Result[AQI and pollutants]
    Result --> DB[(Prediction history)]
    DB --> Mobile[Result and history screens]
    Mobile --> Cache[(Device cache)]
```

## Included

- deterministic synthetic data generation and validation;
- chronological training and holdout evaluation against mean baselines;
- inverse AQI-band weighting and visible train-versus-holdout metrics;
- one versioned artifact containing both model stages and metadata;
- validated inference, readiness, history, detail, and metrics endpoints;
- SQLite prediction history and retry-safe writes;
- safe failure responses and payload-free request telemetry;
- automated unit, integration, contract, and failure tests;
- local Python and Docker Compose workflows.
- Expo Router mobile navigation and responsive web preview;
- prediction form, result, history, detail, and about screens;
- client validation, retry state, request timeout, network status, and cached history;
- automated mobile validation, API client, storage, and component tests.

## Deferred

- authentication and record ownership will follow the mobile identity decision;
- public hosting and cloud infrastructure are outside the portfolio definition of done;
- health, regulatory, or emergency use requires real validated data and domain review.

## Acceptance criteria

1. A clean checkout can generate data, train the model, and start the API from documented commands.
2. Dataset violations stop training before a model artifact is written.
3. Holdout metrics and dataset fingerprints make training results reproducible and inspectable.
4. Valid prediction input returns bounded AQI, pollutant estimates, category, model version, identifier, and timestamp.
5. A successful prediction is persisted and can be read through list and detail endpoints.
6. Repeated mobile requests with one idempotency key do not duplicate history.
7. Invalid input, conflicting retries, missing models, unavailable storage, and unknown records return stable safe errors.
8. Readiness requires both the model artifact and prediction database.
9. Logs and metrics expose operations without logging prediction payloads.
10. Formatting, file limits, tests, and CI all pass.
11. A user can complete prediction, history, and detail flows from the mobile interface.
12. An unavailable API produces a clear error while previously cached history remains readable.
13. The application can be opened through Expo Go, an emulator, or a local web preview with a configurable API URL.
