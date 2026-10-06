FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AWAIR_ARTIFACT_PATH=/app/artifacts/model.joblib

WORKDIR /app
COPY pyproject.toml README.md ./
COPY src ./src
RUN pip install --no-cache-dir .

COPY . .
RUN awair-generate --rows 4000 --seed 42 \
    && awair-train --seed 42

USER 65532:65532
EXPOSE 8000
CMD ["uvicorn", "awair.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
