from __future__ import annotations

import hashlib
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from awair.data.validation import validate_dataset
from awair.features import AQI_TARGET, CONTEXT_FEATURES, POLLUTANT_TARGETS, TIMESTAMP_COLUMN
from awair.modeling.artifact import ModelBundle, save_bundle
from awair.modeling.evaluation import multioutput_metrics, regression_metrics


def train_from_csv(data_path: Path, artifact_path: Path, seed: int = 42) -> ModelBundle:
    frame = pd.read_csv(data_path)
    summary = validate_dataset(frame)
    frame[TIMESTAMP_COLUMN] = pd.to_datetime(frame[TIMESTAMP_COLUMN])
    frame = frame.sort_values(TIMESTAMP_COLUMN).reset_index(drop=True)
    train, test = chronological_split(frame)
    sample_weights = aqi_sample_weights(train[AQI_TARGET])

    pollutant_model = build_pollutant_model(seed)
    pollutant_model.fit(
        train[CONTEXT_FEATURES],
        train[POLLUTANT_TARGETS],
        model__sample_weight=sample_weights,
    )

    aqi_model = build_aqi_model()
    aqi_model.fit(
        train[POLLUTANT_TARGETS],
        train[AQI_TARGET],
        model__sample_weight=sample_weights,
    )

    metrics = evaluate_models(pollutant_model, aqi_model, train, test)
    model_version = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    bundle = ModelBundle(
        pollutant_model=pollutant_model,
        aqi_model=aqi_model,
        context_features=CONTEXT_FEATURES,
        pollutant_targets=POLLUTANT_TARGETS,
        metadata={
            "model_version": model_version,
            "trained_at": datetime.now(UTC).isoformat(),
            "dataset_sha256": file_sha256(data_path),
            "dataset_summary": summary.__dict__,
            "split": {
                "strategy": "chronological",
                "train_rows": len(train),
                "test_rows": len(test),
            },
            "aqi_band_counts": {
                "train": aqi_band_counts(train[AQI_TARGET]),
                "test": aqi_band_counts(test[AQI_TARGET]),
            },
            "sample_weighting": "inverse AQI band frequency",
            "library_versions": {"scikit_learn": sklearn.__version__, "pandas": pd.__version__},
            "metrics": metrics,
        },
    )
    save_bundle(bundle, artifact_path)
    return bundle


def chronological_split(
    frame: pd.DataFrame, test_ratio: float = 0.2
) -> tuple[pd.DataFrame, pd.DataFrame]:
    if not 0.1 <= test_ratio <= 0.4:
        raise ValueError("test_ratio must be between 0.1 and 0.4")
    split_index = int(len(frame) * (1 - test_ratio))
    return frame.iloc[:split_index].copy(), frame.iloc[split_index:].copy()


def build_pollutant_model(seed: int) -> Pipeline:
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            (
                "model",
                RandomForestRegressor(
                    n_estimators=160,
                    max_depth=14,
                    min_samples_leaf=2,
                    random_state=seed,
                    n_jobs=-1,
                ),
            ),
        ]
    )


def build_aqi_model() -> Pipeline:
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", LinearRegression()),
        ]
    )


def evaluate_models(pollutant_model, aqi_model, train: pd.DataFrame, test: pd.DataFrame) -> dict:
    train_pollutants = pollutant_model.predict(train[CONTEXT_FEATURES])
    train_aqi = aqi_model.predict(pd.DataFrame(train_pollutants, columns=POLLUTANT_TARGETS))
    predicted_pollutants = pollutant_model.predict(test[CONTEXT_FEATURES])
    predicted_aqi = aqi_model.predict(pd.DataFrame(predicted_pollutants, columns=POLLUTANT_TARGETS))
    pollutant_baseline = np.tile(train[POLLUTANT_TARGETS].mean().to_numpy(), (len(test), 1))
    aqi_baseline = np.repeat(train[AQI_TARGET].mean(), len(test))

    return {
        "pollutant_train": multioutput_metrics(
            train[POLLUTANT_TARGETS].to_numpy(), train_pollutants, POLLUTANT_TARGETS
        ),
        "pollutant_model": multioutput_metrics(
            test[POLLUTANT_TARGETS].to_numpy(), predicted_pollutants, POLLUTANT_TARGETS
        ),
        "pollutant_mean_baseline": multioutput_metrics(
            test[POLLUTANT_TARGETS].to_numpy(), pollutant_baseline, POLLUTANT_TARGETS
        ),
        "aqi_train": regression_metrics(train[AQI_TARGET].to_numpy(), train_aqi),
        "aqi_model": regression_metrics(test[AQI_TARGET].to_numpy(), predicted_aqi),
        "aqi_mean_baseline": regression_metrics(test[AQI_TARGET].to_numpy(), aqi_baseline),
    }


def aqi_sample_weights(values: pd.Series) -> np.ndarray:
    bands = pd.cut(
        values,
        bins=[-np.inf, 50, 100, 150, 200, 300, np.inf],
        labels=False,
        include_lowest=True,
    )
    counts = bands.value_counts()
    weights = bands.map(lambda band: 1 / counts.loc[band]).to_numpy(dtype=float)
    return weights / weights.mean()


def aqi_band_counts(values: pd.Series) -> dict[str, int]:
    labels = ["0-50", "51-100", "101-150", "151-200", "201-300", "301+"]
    bands = pd.cut(
        values,
        bins=[-np.inf, 50, 100, 150, 200, 300, np.inf],
        labels=labels,
        include_lowest=True,
    )
    counts = bands.value_counts(sort=False)
    return {label: int(counts.get(label, 0)) for label in labels}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
