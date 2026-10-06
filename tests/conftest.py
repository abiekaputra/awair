from pathlib import Path

import pytest

from awair.data.synthetic import generate_dataset
from awair.modeling.training import train_from_csv


@pytest.fixture(scope="session")
def trained_artifact(tmp_path_factory: pytest.TempPathFactory) -> Path:
    directory = tmp_path_factory.mktemp("trained-model")
    data_path = directory / "data.csv"
    artifact_path = directory / "model.joblib"
    generate_dataset(rows=800, seed=7).to_csv(data_path, index=False)
    train_from_csv(data_path, artifact_path, seed=7)
    return artifact_path
