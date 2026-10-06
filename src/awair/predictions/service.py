from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from awair.api.registry import ModelRegistry
from awair.predictions.models import PredictionRecord
from awair.predictions.repository import PredictionRepository


class IdempotencyConflictError(ValueError):
    """Raised when one retry key is reused with different inputs."""


class PredictionService:
    def __init__(self, registry: ModelRegistry, repository: PredictionRepository) -> None:
        self.registry = registry
        self.repository = repository

    def predict(
        self,
        inputs: dict[str, float],
        idempotency_key: str | None = None,
    ) -> PredictionRecord:
        if idempotency_key:
            existing = self.repository.find_by_idempotency_key(idempotency_key)
            if existing:
                self._ensure_same_inputs(existing, inputs)
                return existing

        result = self.registry.get().predict(inputs)
        record = PredictionRecord(
            id=str(uuid4()),
            created_at=datetime.now(UTC).isoformat(),
            inputs=inputs,
            pollutants=result["pollutants"],
            aqi=result["aqi"],
            category=result["category"],
            model_version=result["model_version"],
        )
        saved = self.repository.save(record, idempotency_key)
        self._ensure_same_inputs(saved, inputs)
        return saved

    @staticmethod
    def _ensure_same_inputs(record: PredictionRecord, inputs: dict[str, float]) -> None:
        if record.inputs != inputs:
            raise IdempotencyConflictError(
                "Idempotency key was already used with different inputs."
            )
