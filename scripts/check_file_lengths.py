from __future__ import annotations

from pathlib import Path


def main() -> None:
    violations: list[str] = []
    for path in Path(".").rglob("*.py"):
        if any(part.startswith(".") for part in path.parts) or ".venv" in path.parts:
            continue
        limit = 1_000 if "tests" in path.parts else 400
        lines = len(path.read_text().splitlines())
        if lines > limit:
            violations.append(f"{path}: {lines} lines (limit {limit})")

    if violations:
        raise SystemExit("File length limits exceeded:\n" + "\n".join(violations))
    print("File length limits passed.")


if __name__ == "__main__":
    main()
