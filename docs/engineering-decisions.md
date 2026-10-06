# Engineering decisions

## Fresh implementation

The original AWAIR capstone was a team project and its abandoned repository did not provide a safe basis for a personal portfolio copy. This edition uses new code, synthetic data, and explicit attribution. It represents the machine learning scope without claiming the team's mobile and cloud work.

## Chronological split

A random split can put later and earlier observations in both sets and overstate time dependent performance. A chronological holdout better reflects the question this demo asks: how does the fitted pipeline behave on observations that occur after its training window?

## Baselines before complexity

Every target is compared with a training-mean prediction. A fitted model that cannot beat this baseline has not justified its complexity. The check is automated in the test suite for the deterministic synthetic dataset.

## Imbalance and overfitting evidence

AQI bands are uneven even in the generated data. Training applies inverse band-frequency sample weights so rare bands influence fitting without synthetic row duplication. The artifact records the train/test band distribution and both train and holdout metrics. Random Forest depth and leaf size are bounded; the chronological holdout remains the final evidence.

## One versioned bundle

Both stages and their metadata are saved together. This prevents the API from accidentally loading incompatible pollutant and AQI models. The tradeoff is a larger artifact and all-at-once deployment.

## Lazy model loading

The process can answer `/health` even when model storage is unavailable. Readiness remains false and prediction returns `503`. This distinction supports orchestration and avoids advertising a broken replica as ready.

## Metrics without payload logging

Prometheus counters and histograms record volume, latency, status, predictions, and model failures. Structured logs include request ID and route but omit input values, which reduces accidental data exposure when real inputs are introduced.
