from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class PredictionRecord:
    id: str
    created_at: str
    inputs: dict[str, float]
    pollutants: dict[str, float]
    aqi: float
    category: str
    model_version: str

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)
