from __future__ import annotations

import argparse
from pathlib import Path

from awair.data.synthetic import generate_dataset


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a reproducible synthetic AWAIR dataset.")
    parser.add_argument("--output", type=Path, default=Path("data/synthetic_air_quality.csv"))
    parser.add_argument("--rows", type=int, default=4_000)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    frame = generate_dataset(rows=args.rows, seed=args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(args.output, index=False)
    print(f"Generated {len(frame)} rows at {args.output}")
