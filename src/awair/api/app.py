from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Request

from awair.api.observability import (
    MODEL_FAILURE_COUNT,
    PREDICTION_COUNT,
    RequestTelemetryMiddleware,
    metrics_response,
)
from awair.api.registry import ModelRegistry, ModelUnavailableError
from awair.api.schemas import (
    HealthResponse,
    PredictionRequest,
    PredictionResponse,
    ReadinessResponse,
)
from awair.config import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or Settings.from_env()
    logging.basicConfig(
        level=resolved_settings.log_level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    app = FastAPI(
        title="AWAIR Prediction API",
        version="0.1.0",
        description="Two-stage pollutant and AQI prediction service.",
    )
    app.state.settings = resolved_settings
    app.state.registry = ModelRegistry(resolved_settings.artifact_path)
    app.add_middleware(RequestTelemetryMiddleware)

    @app.get("/health", response_model=HealthResponse, tags=["operations"])
    def health() -> HealthResponse:
        return HealthResponse(status="ok", service=resolved_settings.service_name)

    @app.get("/ready", response_model=ReadinessResponse, tags=["operations"])
    def readiness(request: Request) -> ReadinessResponse:
        ready, version = request.app.state.registry.readiness()
        if not ready:
            raise HTTPException(status_code=503, detail="Model artifact is not ready.")
        return ReadinessResponse(ready=True, model_version=version)

    @app.post("/predict", response_model=PredictionResponse, tags=["prediction"])
    def predict(payload: PredictionRequest, request: Request) -> PredictionResponse:
        try:
            prediction = request.app.state.registry.get().predict(payload.model_dump())
        except ModelUnavailableError as error:
            MODEL_FAILURE_COUNT.inc()
            raise HTTPException(
                status_code=503, detail="Prediction model is unavailable."
            ) from error
        except Exception as error:
            MODEL_FAILURE_COUNT.inc()
            logging.getLogger("awair.model").exception("Prediction failed")
            raise HTTPException(
                status_code=500, detail="Prediction could not be completed."
            ) from error

        PREDICTION_COUNT.inc()
        return PredictionResponse(**prediction)

    @app.get("/metrics", include_in_schema=False)
    def metrics():
        return metrics_response()

    return app


app = create_app()
