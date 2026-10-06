from __future__ import annotations

import argparse
import json
from pathlib import Path

from awair.modeling.training import train_from_csv


def main() -> None:
    parser = argparse.ArgumentParser(description="Train and evaluate the AWAIR model bundle.")
    parser.add_argument("--data", type=Path, default=Path("data/synthetic_air_quality.csv"))
    parser.add_argument("--artifact", type=Path, default=Path("artifacts/model.joblib"))
    parser.add_argument("--metrics", type=Path, default=Path("artifacts/metrics.json"))
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    bundle = train_from_csv(args.data, args.artifact, seed=args.seed)
    args.metrics.parent.mkdir(parents=True, exist_ok=True)
    args.metrics.write_text(json.dumps(bundle.metadata, indent=2) + "\n")
    print(json.dumps(bundle.metadata["metrics"], indent=2))
