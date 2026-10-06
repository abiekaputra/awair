from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from awair.features import AQI_TARGET, CONTEXT_FEATURES, POLLUTANT_TARGETS, TIMESTAMP_COLUMN


class DatasetValidationError(ValueError):
    """Raised when a training dataset violates the contract."""


@dataclass(frozen=True)
class DatasetSummary:
    rows: int
    start: str
    end: str
    maximum_feature_missing_ratio: float


def validate_dataset(frame: pd.DataFrame) -> DatasetSummary:
    required = [TIMESTAMP_COLUMN, *CONTEXT_FEATURES, *POLLUTANT_TARGETS, AQI_TARGET]
    missing_columns = sorted(set(required) - set(frame.columns))
    if missing_columns:
        raise DatasetValidationError(f"Missing required columns: {', '.join(missing_columns)}")
    if len(frame) < 100:
        raise DatasetValidationError("Dataset must contain at least 100 rows.")

    timestamps = pd.to_datetime(frame[TIMESTAMP_COLUMN], errors="coerce")
    if timestamps.isna().any():
        raise DatasetValidationError("timestamp contains invalid values.")
    if timestamps.duplicated().any():
        raise DatasetValidationError("timestamp must be unique.")

    numeric_columns = [*CONTEXT_FEATURES, *POLLUTANT_TARGETS, AQI_TARGET]
    converted = frame[numeric_columns].apply(pd.to_numeric, errors="coerce")
    if converted[POLLUTANT_TARGETS + [AQI_TARGET]].isna().any().any():
        raise DatasetValidationError("Targets cannot contain missing or non-numeric values.")

    missing_ratio = converted[CONTEXT_FEATURES].isna().mean()
    if float(missing_ratio.max()) > 0.1:
        raise DatasetValidationError("A context feature exceeds the 10% missing-value limit.")
    if (converted[POLLUTANT_TARGETS + [AQI_TARGET]] < 0).any().any():
        raise DatasetValidationError("Pollutant and AQI targets cannot be negative.")
    if not converted["hour"].dropna().between(0, 23).all():
        raise DatasetValidationError("hour must be between 0 and 23.")
    for index_name in ["traffic_index", "industrial_index"]:
        if not converted[index_name].dropna().between(0, 1).all():
            raise DatasetValidationError(f"{index_name} must be between 0 and 1.")

    return DatasetSummary(
        rows=len(frame),
        start=timestamps.min().isoformat(),
        end=timestamps.max().isoformat(),
        maximum_feature_missing_ratio=float(missing_ratio.max()),
    )
