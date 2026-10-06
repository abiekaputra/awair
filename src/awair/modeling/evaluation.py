from __future__ import annotations

import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def regression_metrics(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    return {
        "mae": round(float(mean_absolute_error(actual, predicted)), 4),
        "rmse": round(float(mean_squared_error(actual, predicted) ** 0.5), 4),
        "r2": round(float(r2_score(actual, predicted)), 4),
    }


def multioutput_metrics(
    actual: np.ndarray,
    predicted: np.ndarray,
    target_names: list[str],
) -> dict[str, dict[str, float]]:
    return {
        target: regression_metrics(actual[:, index], predicted[:, index])
        for index, target in enumerate(target_names)
    }
