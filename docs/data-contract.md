# Data contract

Each row represents one hourly observation. Training sorts rows by `timestamp` before creating the chronological split.

| Column | Type | Constraint | Role |
| --- | --- | --- | --- |
| `timestamp` | datetime | Unique, valid | Ordering only |
| `temperature_c` | float | -20 to 60 at API boundary | Context feature |
| `humidity_pct` | float | 0 to 100 | Context feature |
| `wind_speed_mps` | float | 0 to 30 at API boundary | Context feature |
| `hour` | integer | 0 to 23 | Context feature |
| `traffic_index` | float | 0 to 1 | Context feature |
| `industrial_index` | float | 0 to 1 | Context feature |
| `pm25`, `pm10` | float | Nonnegative | Pollutant targets |
| `no2`, `so2`, `co`, `o3` | float | Nonnegative | Pollutant targets |
| `aqi` | float | Nonnegative | AQI target |

Pollutant and AQI targets must be complete. Context features may contain at most 10% missing values per column because the pollutant pipeline includes median imputation.

## Synthetic data

The included generator models plausible relationships between traffic, industrial activity, weather, dispersion, pollutant concentration, and an approximate AQI target. It exists to make the engineering path executable without publishing team or third party data.

Synthetic performance does not demonstrate accuracy on real sensor observations. A real evaluation must document sensor provenance, calibration, missingness, spatial coverage, time coverage, concept drift, and licensing.
