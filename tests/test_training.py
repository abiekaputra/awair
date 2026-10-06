from pathlib import Path

import joblib
import pandas as pd
import pytest

from awair.data.synthetic import generate_dataset
from awair.features import CONTEXT_FEATURES, POLLUTANT_TARGETS
from awair.modeling.artifact import load_bundle
from awair.modeling.training import aqi_sample_weights, chronological_split, train_from_csv


def test_chronological_split_preserves_order() -> None:
    frame = generate_dataset(rows=120)
    train, test = chronological_split(frame)

    assert len(train) == 96
    assert len(test) == 24
    assert train["timestamp"].max() < test["timestamp"].min()


def test_aqi_sample_weights_increase_influence_of_rare_bands() -> None:
    values = pd.Series([40.0] * 8 + [120.0] * 2)

    weights = aqi_sample_weights(values)

    assert weights.mean() == pytest.approx(1.0)
    assert weights[-1] > weights[0]


def test_training_persists_reproducible_metadata_and_beats_mean_baselines(tmp_path: Path) -> None:
    data_path = tmp_path / "data.csv"
    artifact_path = tmp_path / "model.joblib"
    generate_dataset(rows=700, seed=17).to_csv(data_path, index=False)

    bundle = train_from_csv(data_path, artifact_path, seed=17)

    assert artifact_path.is_file()
    assert bundle.context_features == CONTEXT_FEATURES
    assert bundle.pollutant_targets == POLLUTANT_TARGETS
    assert len(bundle.metadata["dataset_sha256"]) == 64
    assert bundle.metadata["sample_weighting"] == "inverse AQI band frequency"
    assert sum(bundle.metadata["aqi_band_counts"]["test"].values()) == 140
    assert bundle.metadata["split"] == {
        "strategy": "chronological",
        "train_rows": 560,
        "test_rows": 140,
    }
    assert (
        bundle.metadata["metrics"]["aqi_model"]["mae"]
        < bundle.metadata["metrics"]["aqi_mean_baseline"]["mae"]
    )
    assert bundle.metadata["metrics"]["aqi_train"]["mae"] >= 0
    for pollutant in POLLUTANT_TARGETS:
        model_mae = bundle.metadata["metrics"]["pollutant_model"][pollutant]["mae"]
        baseline_mae = bundle.metadata["metrics"]["pollutant_mean_baseline"][pollutant]["mae"]
        assert model_mae < baseline_mae


def test_loaded_bundle_returns_bounded_prediction(trained_artifact: Path) -> None:
    bundle = load_bundle(trained_artifact)

    prediction = bundle.predict(
        {
            "temperature_c": 30,
            "humidity_pct": 70,
            "wind_speed_mps": 2.5,
            "hour": 8,
            "traffic_index": 0.8,
            "industrial_index": 0.4,
        }
    )

    assert 0 <= prediction["aqi"] <= 500
    assert set(prediction["pollutants"]) == set(POLLUTANT_TARGETS)
    assert prediction["model_version"] == bundle.metadata["model_version"]


def test_invalid_artifact_type_is_rejected(tmp_path: Path) -> None:
    path = tmp_path / "invalid.joblib"
    joblib.dump({"model": "not-a-bundle"}, path)

    try:
        load_bundle(path)
    except TypeError as error:
        assert "ModelBundle" in str(error)
    else:
        raise AssertionError("Invalid artifact should be rejected")
