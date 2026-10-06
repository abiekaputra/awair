from __future__ import annotations

import numpy as np
import pandas as pd

from awair.features import AQI_TARGET, CONTEXT_FEATURES, POLLUTANT_TARGETS, TIMESTAMP_COLUMN


def generate_dataset(rows: int = 4_000, seed: int = 42) -> pd.DataFrame:
    if rows < 100:
        raise ValueError("rows must be at least 100")

    rng = np.random.default_rng(seed)
    timestamp = pd.date_range("2023-01-01", periods=rows, freq="h")
    hour = timestamp.hour.to_numpy()
    day = np.arange(rows) / 24

    traffic = np.clip(
        0.45 + 0.3 * np.sin((hour - 7) * np.pi / 12) + rng.normal(0, 0.09, rows),
        0,
        1,
    )
    industry = np.clip(0.55 + 0.15 * np.sin(day * np.pi / 14) + rng.normal(0, 0.1, rows), 0, 1)
    temperature = 28 + 3 * np.sin((hour - 10) * np.pi / 12) + rng.normal(0, 1.2, rows)
    humidity = np.clip(72 - 1.8 * (temperature - 28) + rng.normal(0, 5, rows), 35, 100)
    wind = np.clip(rng.gamma(2.2, 0.8, rows), 0.1, 9)

    dispersion = 1 / (1 + 0.35 * wind)
    pm25 = np.clip(
        (18 + 55 * traffic + 45 * industry) * dispersion + rng.normal(0, 5, rows), 1, None
    )
    pm10 = np.clip(1.35 * pm25 + 8 * traffic + rng.normal(0, 8, rows), 2, None)
    no2 = np.clip(
        (12 + 70 * traffic + 20 * industry) * dispersion + rng.normal(0, 4, rows), 1, None
    )
    so2 = np.clip((5 + 45 * industry) * dispersion + rng.normal(0, 3, rows), 0.2, None)
    co = np.clip(
        (0.3 + 3.2 * traffic + 1.4 * industry) * dispersion + rng.normal(0, 0.2, rows), 0.05, None
    )
    o3 = np.clip(25 + 1.8 * (temperature - 25) - 0.2 * humidity + rng.normal(0, 5, rows), 1, None)

    pollutant_matrix = np.column_stack([pm25, pm10, no2, so2, co, o3])
    aqi_components = np.column_stack([pm25 * 2.3, pm10 * 1.15, no2 * 1.25, so2, co * 11, o3 * 1.1])
    aqi = np.clip(aqi_components.max(axis=1) + rng.normal(0, 4, rows), 0, 500)

    frame = pd.DataFrame(
        {
            TIMESTAMP_COLUMN: timestamp,
            "temperature_c": temperature,
            "humidity_pct": humidity,
            "wind_speed_mps": wind,
            "hour": hour,
            "traffic_index": traffic,
            "industrial_index": industry,
            **dict(zip(POLLUTANT_TARGETS, pollutant_matrix.T, strict=True)),
            AQI_TARGET: aqi,
        }
    )
    _inject_feature_gaps(frame, rng)
    return frame


def _inject_feature_gaps(
    frame: pd.DataFrame, rng: np.random.Generator, ratio: float = 0.015
) -> None:
    for feature in CONTEXT_FEATURES[:3]:
        indexes = rng.choice(frame.index, size=int(len(frame) * ratio), replace=False)
        frame.loc[indexes, feature] = np.nan
