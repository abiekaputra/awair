from __future__ import annotations

from pathlib import Path


def main() -> None:
    violations: list[str] = []
    code_extensions = {".py", ".js", ".jsx", ".ts", ".tsx"}
    ignored_directories = {".git", ".venv", "node_modules", "dist", "coverage"}
    for path in Path(".").rglob("*"):
        if path.suffix not in code_extensions:
            continue
        if any(part in ignored_directories or part.startswith(".") for part in path.parts):
            continue
        is_test = "tests" in path.parts or "__tests__" in path.parts
        limit = 1_000 if is_test else (400 if path.suffix == ".py" else 300)
        lines = len(path.read_text().splitlines())
        if lines > limit:
            violations.append(f"{path}: {lines} lines (limit {limit})")

    if violations:
        raise SystemExit("File length limits exceeded:\n" + "\n".join(violations))
    print("File length limits passed.")


if __name__ == "__main__":
    main()
