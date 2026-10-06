from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from awair.features import aqi_category


@dataclass
class ModelBundle:
    pollutant_model: Any
    aqi_model: Any
    context_features: list[str]
    pollutant_targets: list[str]
    metadata: dict[str, Any]

    def predict(self, features: dict[str, float]) -> dict[str, Any]:
        frame = pd.DataFrame([features], columns=self.context_features)
        pollutant_values = self.pollutant_model.predict(frame)[0]
        pollutant_frame = pd.DataFrame([pollutant_values], columns=self.pollutant_targets)
        aqi = float(self.aqi_model.predict(pollutant_frame)[0])
        pollutants = {
            name: round(max(0.0, float(value)), 3)
            for name, value in zip(self.pollutant_targets, pollutant_values, strict=True)
        }
        bounded_aqi = round(min(500.0, max(0.0, aqi)), 2)

        return {
            "pollutants": pollutants,
            "aqi": bounded_aqi,
            "category": aqi_category(bounded_aqi),
            "model_version": self.metadata["model_version"],
        }


def save_bundle(bundle: ModelBundle, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, path)


def load_bundle(path: Path) -> ModelBundle:
    bundle = joblib.load(path)
    if not isinstance(bundle, ModelBundle):
        raise TypeError("Artifact does not contain an AWAIR ModelBundle.")
    return bundle
