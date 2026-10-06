from __future__ import annotations

from pathlib import Path
from threading import Lock

from awair.modeling.artifact import ModelBundle, load_bundle


class ModelUnavailableError(RuntimeError):
    """Raised when a valid model artifact cannot be loaded."""


class ModelRegistry:
    def __init__(self, artifact_path: Path) -> None:
        self.artifact_path = artifact_path
        self._bundle: ModelBundle | None = None
        self._lock = Lock()

    def get(self) -> ModelBundle:
        if self._bundle is None:
            with self._lock:
                if self._bundle is None:
                    self._bundle = self._load()
        return self._bundle

    def readiness(self) -> tuple[bool, str | None]:
        try:
            bundle = self.get()
        except ModelUnavailableError:
            return False, None
        return True, bundle.metadata["model_version"]

    def _load(self) -> ModelBundle:
        if not self.artifact_path.is_file():
            raise ModelUnavailableError("Model artifact is not available.")
        try:
            return load_bundle(self.artifact_path)
        except Exception as error:
            raise ModelUnavailableError("Model artifact is invalid.") from error
