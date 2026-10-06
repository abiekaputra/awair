# Model card

## Intended use

AWAIR demonstrates a reproducible two-stage regression system and its serving boundary. It may be used for software evaluation, local experiments, and interview discussion.

It must not be used for health advice, regulatory reporting, emergency response, or public pollution alerts. The default model is trained on synthetic data and its categories are illustrative.

## Models

1. A multi-output `RandomForestRegressor` predicts PM2.5, PM10, NO2, SO2, CO, and O3 from weather and context features.
2. A standardized `LinearRegression` predicts AQI from the six pollutant values.

The first stage handles nonlinear context relationships. The second remains interpretable and preserves the original project focus on linear AQI regression.

## Evaluation

Records are ordered by time. The first 80% trains the estimators and the last 20% evaluates future-like observations. MAE, RMSE, and R² are recorded for every pollutant and AQI. Each result is compared with a training-mean baseline.

Training observations receive inverse-frequency weights based on AQI bands. This gives rarer high-AQI observations more influence without duplicating rows. Metrics are recorded for both the training and chronological holdout windows so a large generalization gap remains visible instead of being hidden behind one score.

Run `uv run awair-train` to regenerate the exact metrics in `artifacts/metrics.json`. Metrics are evidence for the synthetic dataset only.

## Known limitations

- No real monitoring station data is included.
- Spatial location, seasonality beyond the generated period, sensor calibration, fires, and weather fronts are not represented realistically.
- The approximate AQI target is not an implementation of a jurisdiction's official breakpoint standard.
- Random Forest prediction intervals and uncertainty calibration are not implemented.
- No drift detector or automated retraining policy is included.
