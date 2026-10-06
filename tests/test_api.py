from pathlib import Path

from fastapi.testclient import TestClient

from awair.api.app import create_app
from awair.config import Settings


def test_health_does_not_depend_on_model_artifact(tmp_path: Path) -> None:
    client = TestClient(create_app(Settings(artifact_path=tmp_path / "missing.joblib")))

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "awair-api"}
    assert "x-request-id" in response.headers


def test_readiness_and_prediction_fail_cleanly_without_artifact(tmp_path: Path) -> None:
    client = TestClient(create_app(Settings(artifact_path=tmp_path / "missing.joblib")))

    readiness = client.get("/ready")
    prediction = client.post("/predict", json=valid_payload())

    assert readiness.status_code == 503
    assert readiness.json()["detail"] == "Model artifact is not ready."
    assert prediction.status_code == 503
    assert prediction.json()["detail"] == "Prediction model is unavailable."


def test_prediction_endpoint_returns_versioned_result(trained_artifact: Path) -> None:
    client = TestClient(create_app(Settings(artifact_path=trained_artifact)))

    readiness = client.get("/ready")
    response = client.post("/predict", json=valid_payload())

    assert readiness.status_code == 200
    assert readiness.json()["ready"] is True
    assert response.status_code == 200
    assert 0 <= response.json()["aqi"] <= 500
    assert response.json()["model_version"] == readiness.json()["model_version"]


def test_prediction_contract_rejects_out_of_range_and_unknown_inputs(
    trained_artifact: Path,
) -> None:
    client = TestClient(create_app(Settings(artifact_path=trained_artifact)))
    payload = valid_payload() | {"humidity_pct": 120, "unknown": "value"}

    response = client.post("/predict", json=payload)

    assert response.status_code == 422
    locations = {tuple(error["loc"]) for error in response.json()["detail"]}
    assert ("body", "humidity_pct") in locations
    assert ("body", "unknown") in locations


def test_metrics_endpoint_exposes_service_counters(trained_artifact: Path) -> None:
    client = TestClient(create_app(Settings(artifact_path=trained_artifact)))
    client.post("/predict", json=valid_payload())

    response = client.get("/metrics")

    assert response.status_code == 200
    assert "awair_predictions_total" in response.text
    assert "awair_http_request_duration_seconds" in response.text


def valid_payload() -> dict:
    return {
        "temperature_c": 30,
        "humidity_pct": 70,
        "wind_speed_mps": 2.5,
        "hour": 8,
        "traffic_index": 0.8,
        "industrial_index": 0.4,
    }
