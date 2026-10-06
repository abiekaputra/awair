from __future__ import annotations

import logging

from fastapi import FastAPI, Header, HTTPException, Query, Request

from awair.api.observability import (
    MODEL_FAILURE_COUNT,
    PREDICTION_COUNT,
    RequestTelemetryMiddleware,
    metrics_response,
)
from awair.api.registry import ModelRegistry, ModelUnavailableError
from awair.api.schemas import (
    HealthResponse,
    PredictionHistoryResponse,
    PredictionRequest,
    PredictionResponse,
    ReadinessResponse,
)
from awair.config import Settings
from awair.predictions.repository import PredictionRepository, PredictionStorageError
from awair.predictions.service import IdempotencyConflictError, PredictionService


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
    app.state.predictions = PredictionRepository(resolved_settings.database_path)
    app.state.prediction_service = PredictionService(app.state.registry, app.state.predictions)
    app.add_middleware(RequestTelemetryMiddleware)

    @app.get("/health", response_model=HealthResponse, tags=["operations"])
    def health() -> HealthResponse:
        return HealthResponse(status="ok", service=resolved_settings.service_name)

    @app.get("/ready", response_model=ReadinessResponse, tags=["operations"])
    def readiness(request: Request) -> ReadinessResponse:
        ready, version = request.app.state.registry.readiness()
        database_ready = request.app.state.predictions.readiness()
        if not ready or not database_ready:
            raise HTTPException(status_code=503, detail="Service dependencies are not ready.")
        return ReadinessResponse(ready=True, model_version=version, database_ready=True)

    @app.post("/predict", response_model=PredictionResponse, tags=["prediction"])
    def predict(
        payload: PredictionRequest,
        request: Request,
        idempotency_key: str | None = Header(default=None, max_length=128),
    ) -> PredictionResponse:
        try:
            prediction = request.app.state.prediction_service.predict(
                payload.model_dump(), idempotency_key
            )
        except ModelUnavailableError as error:
            MODEL_FAILURE_COUNT.inc()
            raise HTTPException(
                status_code=503, detail="Prediction model is unavailable."
            ) from error
        except PredictionStorageError as error:
            raise HTTPException(
                status_code=503, detail="Prediction history is unavailable."
            ) from error
        except IdempotencyConflictError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        except Exception as error:
            MODEL_FAILURE_COUNT.inc()
            logging.getLogger("awair.model").exception("Prediction failed")
            raise HTTPException(
                status_code=500, detail="Prediction could not be completed."
            ) from error

        PREDICTION_COUNT.inc()
        return PredictionResponse(**prediction.as_dict())

    @app.get(
        "/predictions",
        response_model=PredictionHistoryResponse,
        tags=["prediction"],
    )
    def prediction_history(
        request: Request,
        limit: int = Query(default=20, ge=1, le=100),
    ) -> PredictionHistoryResponse:
        try:
            records = request.app.state.predictions.list_recent(limit)
        except PredictionStorageError as error:
            raise HTTPException(
                status_code=503, detail="Prediction history is unavailable."
            ) from error
        return PredictionHistoryResponse(
            items=[PredictionResponse(**record.as_dict()) for record in records]
        )

    @app.get(
        "/predictions/{prediction_id}",
        response_model=PredictionResponse,
        tags=["prediction"],
    )
    def prediction_detail(prediction_id: str, request: Request) -> PredictionResponse:
        try:
            record = request.app.state.predictions.find(prediction_id)
        except PredictionStorageError as error:
            raise HTTPException(
                status_code=503, detail="Prediction history is unavailable."
            ) from error
        if record is None:
            raise HTTPException(status_code=404, detail="Prediction was not found.")
        return PredictionResponse(**record.as_dict())

    @app.get("/metrics", include_in_schema=False)
    def metrics():
        return metrics_response()

    return app


app = create_app()
