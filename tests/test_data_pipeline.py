import pandas as pd
import pytest

from awair.data.synthetic import generate_dataset
from awair.data.validation import DatasetValidationError, validate_dataset


def test_synthetic_generation_is_reproducible() -> None:
    first = generate_dataset(rows=120, seed=11)
    second = generate_dataset(rows=120, seed=11)

    pd.testing.assert_frame_equal(first, second)


def test_dataset_contract_accepts_bounded_feature_gaps() -> None:
    frame = generate_dataset(rows=200, seed=13)

    summary = validate_dataset(frame)

    assert summary.rows == 200
    assert 0 < summary.maximum_feature_missing_ratio <= 0.1


def test_dataset_contract_rejects_missing_columns() -> None:
    frame = generate_dataset(rows=120).drop(columns=["aqi"])

    with pytest.raises(DatasetValidationError, match="Missing required columns: aqi"):
        validate_dataset(frame)


def test_dataset_contract_rejects_duplicate_timestamps() -> None:
    frame = generate_dataset(rows=120)
    frame.loc[1, "timestamp"] = frame.loc[0, "timestamp"]

    with pytest.raises(DatasetValidationError, match="timestamp must be unique"):
        validate_dataset(frame)


def test_dataset_contract_rejects_excessive_missing_features() -> None:
    frame = generate_dataset(rows=120)
    frame.loc[:30, "temperature_c"] = None

    with pytest.raises(DatasetValidationError, match="10% missing-value limit"):
        validate_dataset(frame)
