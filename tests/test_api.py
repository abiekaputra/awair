from pathlib import Path
from unittest.mock import Mock

from fastapi.testclient import TestClient

from awair.api.app import create_app
from awair.config import Settings


def test_health_does_not_depend_on_model_artifact(tmp_path: Path) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, "missing.joblib")))

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "awair-api"}
    assert "x-request-id" in response.headers


def test_readiness_and_prediction_fail_cleanly_without_artifact(tmp_path: Path) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, "missing.joblib")))

    readiness = client.get("/ready")
    prediction = client.post("/predict", json=valid_payload())

    assert readiness.status_code == 503
    assert readiness.json()["detail"] == "Service dependencies are not ready."
    assert prediction.status_code == 503
    assert prediction.json()["detail"] == "Prediction model is unavailable."


def test_prediction_endpoint_returns_versioned_result(
    trained_artifact: Path, tmp_path: Path
) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, trained_artifact)))

    readiness = client.get("/ready")
    response = client.post("/predict", json=valid_payload())

    assert readiness.status_code == 200
    assert readiness.json()["ready"] is True
    assert readiness.json()["database_ready"] is True
    assert response.status_code == 200
    assert 0 <= response.json()["aqi"] <= 500
    assert response.json()["inputs"] == valid_payload()
    assert response.json()["model_version"] == readiness.json()["model_version"]


def test_prediction_contract_rejects_out_of_range_and_unknown_inputs(
    trained_artifact: Path, tmp_path: Path
) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, trained_artifact)))
    payload = valid_payload() | {"humidity_pct": 120, "unknown": "value"}

    response = client.post("/predict", json=payload)

    assert response.status_code == 422
    locations = {tuple(error["loc"]) for error in response.json()["detail"]}
    assert ("body", "humidity_pct") in locations
    assert ("body", "unknown") in locations


def test_metrics_endpoint_exposes_service_counters(trained_artifact: Path, tmp_path: Path) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, trained_artifact)))
    client.post("/predict", json=valid_payload())

    response = client.get("/metrics")

    assert response.status_code == 200
    assert "awair_predictions_total" in response.text
    assert "awair_http_request_duration_seconds" in response.text


def test_prediction_is_persisted_and_available_in_history(
    trained_artifact: Path, tmp_path: Path
) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, trained_artifact)))

    created = client.post("/predict", json=valid_payload())
    assert created.status_code == 200

    history = client.get("/predictions")
    detail = client.get(f"/predictions/{created.json()['id']}")

    assert history.status_code == 200
    assert history.json()["items"] == [created.json()]
    assert detail.json() == created.json()


def test_prediction_history_survives_application_restart(
    trained_artifact: Path, tmp_path: Path
) -> None:
    settings = settings_for_test(tmp_path, trained_artifact)
    first_client = TestClient(create_app(settings))
    created = first_client.post("/predict", json=valid_payload())
    assert created.status_code == 200

    restarted_client = TestClient(create_app(settings))
    history = restarted_client.get("/predictions")

    assert history.status_code == 200
    assert history.json()["items"][0]["id"] == created.json()["id"]


def test_idempotency_key_prevents_duplicate_prediction_history(
    trained_artifact: Path, tmp_path: Path
) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, trained_artifact)))
    headers = {"Idempotency-Key": "mobile-request-001"}

    first = client.post("/predict", json=valid_payload(), headers=headers)
    second = client.post("/predict", json=valid_payload(), headers=headers)
    history = client.get("/predictions")

    assert first.status_code == 200
    assert second.json() == first.json()
    assert len(history.json()["items"]) == 1


def test_idempotency_key_rejects_different_prediction_inputs(
    trained_artifact: Path, tmp_path: Path
) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, trained_artifact)))
    headers = {"Idempotency-Key": "mobile-request-001"}
    client.post("/predict", json=valid_payload(), headers=headers)

    response = client.post(
        "/predict",
        json=valid_payload() | {"temperature_c": 31},
        headers=headers,
    )

    assert response.status_code == 409
    assert "different inputs" in response.json()["detail"]


def test_prediction_history_handles_missing_record_and_invalid_limit(
    trained_artifact: Path, tmp_path: Path
) -> None:
    client = TestClient(create_app(settings_for_test(tmp_path, trained_artifact)))

    assert client.get("/predictions/unknown").status_code == 404
    assert client.get("/predictions?limit=101").status_code == 422


def test_database_failure_returns_safe_unavailable_response(
    trained_artifact: Path, tmp_path: Path
) -> None:
    blocking_file = tmp_path / "not-a-directory"
    blocking_file.write_text("blocked")
    settings = Settings(
        artifact_path=trained_artifact,
        database_path=blocking_file / "awair.sqlite3",
    )
    client = TestClient(create_app(settings))

    readiness = client.get("/ready")
    prediction = client.post("/predict", json=valid_payload())

    assert readiness.status_code == 503
    assert prediction.status_code == 503
    assert prediction.json()["detail"] == "Prediction history is unavailable."
    assert client.get("/predictions").status_code == 503
    assert client.get("/predictions/unknown").status_code == 503


def test_unexpected_inference_failure_returns_generic_error(
    trained_artifact: Path, tmp_path: Path
) -> None:
    app = create_app(settings_for_test(tmp_path, trained_artifact))
    app.state.prediction_service.predict = Mock(side_effect=RuntimeError("internal detail"))
    client = TestClient(app)

    response = client.post("/predict", json=valid_payload())

    assert response.status_code == 500
    assert response.json() == {"detail": "Prediction could not be completed."}
    assert "internal detail" not in response.text


def valid_payload() -> dict:
    return {
        "temperature_c": 30,
        "humidity_pct": 70,
        "wind_speed_mps": 2.5,
        "hour": 8,
        "traffic_index": 0.8,
        "industrial_index": 0.4,
    }


def settings_for_test(tmp_path: Path, artifact: str | Path) -> Settings:
    artifact_path = artifact if isinstance(artifact, Path) else tmp_path / artifact
    return Settings(
        artifact_path=artifact_path,
        database_path=tmp_path / "awair.sqlite3",
    )
