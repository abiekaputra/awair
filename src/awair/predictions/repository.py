from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from awair.predictions.models import PredictionRecord


class PredictionStorageError(RuntimeError):
    """Raised when prediction history storage is unavailable."""


class PredictionRepository:
    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path

    def readiness(self) -> bool:
        try:
            self.initialize()
            with self._connect() as connection:
                connection.execute("SELECT 1").fetchone()
        except (OSError, sqlite3.Error, PredictionStorageError):
            return False
        return True

    def initialize(self) -> None:
        try:
            self.database_path.parent.mkdir(parents=True, exist_ok=True)
            with self._connect() as connection:
                connection.execute(
                    """
                    CREATE TABLE IF NOT EXISTS predictions (
                        id TEXT PRIMARY KEY,
                        created_at TEXT NOT NULL,
                        inputs_json TEXT NOT NULL,
                        pollutants_json TEXT NOT NULL,
                        aqi REAL NOT NULL,
                        category TEXT NOT NULL,
                        model_version TEXT NOT NULL,
                        idempotency_key TEXT UNIQUE
                    )
                    """
                )
                connection.execute(
                    "CREATE INDEX IF NOT EXISTS predictions_created_at_idx "
                    "ON predictions(created_at DESC)"
                )
        except (OSError, sqlite3.Error) as error:
            raise PredictionStorageError("Prediction history is unavailable.") from error

    def save(self, record: PredictionRecord, idempotency_key: str | None) -> PredictionRecord:
        self.initialize()
        try:
            with self._connect() as connection:
                connection.execute(
                    """
                    INSERT INTO predictions (
                        id, created_at, inputs_json, pollutants_json,
                        aqi, category, model_version, idempotency_key
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record.id,
                        record.created_at,
                        json.dumps(record.inputs, sort_keys=True),
                        json.dumps(record.pollutants, sort_keys=True),
                        record.aqi,
                        record.category,
                        record.model_version,
                        idempotency_key,
                    ),
                )
        except sqlite3.IntegrityError as error:
            if idempotency_key and (existing := self.find_by_idempotency_key(idempotency_key)):
                return existing
            raise PredictionStorageError("Prediction history could not be saved.") from error
        except sqlite3.Error as error:
            raise PredictionStorageError("Prediction history could not be saved.") from error
        return record

    def find_by_idempotency_key(self, key: str) -> PredictionRecord | None:
        self.initialize()
        try:
            with self._connect() as connection:
                row = connection.execute(
                    "SELECT * FROM predictions WHERE idempotency_key = ?", (key,)
                ).fetchone()
        except sqlite3.Error as error:
            raise PredictionStorageError("Prediction history could not be read.") from error
        return self._to_record(row) if row else None

    def find(self, prediction_id: str) -> PredictionRecord | None:
        self.initialize()
        try:
            with self._connect() as connection:
                row = connection.execute(
                    "SELECT * FROM predictions WHERE id = ?", (prediction_id,)
                ).fetchone()
        except sqlite3.Error as error:
            raise PredictionStorageError("Prediction history could not be read.") from error
        return self._to_record(row) if row else None

    def list_recent(self, limit: int) -> list[PredictionRecord]:
        self.initialize()
        try:
            with self._connect() as connection:
                rows = connection.execute(
                    "SELECT * FROM predictions ORDER BY created_at DESC, id DESC LIMIT ?", (limit,)
                ).fetchall()
        except sqlite3.Error as error:
            raise PredictionStorageError("Prediction history could not be read.") from error
        return [self._to_record(row) for row in rows]

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path, timeout=5)
        connection.row_factory = sqlite3.Row
        return connection

    @staticmethod
    def _to_record(row: sqlite3.Row) -> PredictionRecord:
        return PredictionRecord(
            id=row["id"],
            created_at=row["created_at"],
            inputs=json.loads(row["inputs_json"]),
            pollutants=json.loads(row["pollutants_json"]),
            aqi=row["aqi"],
            category=row["category"],
            model_version=row["model_version"],
        )
