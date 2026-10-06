FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AWAIR_ARTIFACT_PATH=/app/artifacts/model.joblib \
    AWAIR_DATABASE_PATH=/app/runtime/awair.sqlite3

WORKDIR /app
COPY pyproject.toml README.md ./
COPY src ./src
RUN pip install --no-cache-dir .

COPY . .
RUN awair-generate --rows 4000 --seed 42 \
    && awair-train --seed 42 \
    && mkdir -p /app/runtime \
    && chown -R 65532:65532 /app/runtime

USER 65532:65532
EXPOSE 8000
CMD ["uvicorn", "awair.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
