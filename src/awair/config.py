from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    artifact_path: Path
    database_path: Path = Path("runtime/awair.sqlite3")
    log_level: str = "INFO"
    service_name: str = "awair-api"
    allowed_origins: tuple[str, ...] = (
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    )

    @classmethod
    def from_env(cls) -> Settings:
        return cls(
            artifact_path=Path(os.getenv("AWAIR_ARTIFACT_PATH", "artifacts/model.joblib")),
            database_path=Path(os.getenv("AWAIR_DATABASE_PATH", "runtime/awair.sqlite3")),
            log_level=os.getenv("AWAIR_LOG_LEVEL", "INFO").upper(),
            allowed_origins=tuple(
                origin.strip()
                for origin in os.getenv(
                    "AWAIR_CORS_ORIGINS",
                    "http://localhost:8081,http://127.0.0.1:8081",
                ).split(",")
                if origin.strip()
            ),
        )
