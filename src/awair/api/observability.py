from __future__ import annotations

import json
import logging
import time
import uuid

from fastapi import Request, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

REQUEST_COUNT = Counter(
    "awair_http_requests_total",
    "HTTP requests processed by AWAIR.",
    ["method", "route", "status"],
)
REQUEST_LATENCY = Histogram(
    "awair_http_request_duration_seconds",
    "HTTP request latency for AWAIR.",
    ["method", "route"],
)
PREDICTION_COUNT = Counter("awair_predictions_total", "Predictions returned by AWAIR.")
MODEL_FAILURE_COUNT = Counter("awair_model_failures_total", "Model load or inference failures.")


class RequestTelemetryMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        started = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - started
        route = request.scope.get("route")
        route_path = getattr(route, "path", "unmatched")

        REQUEST_COUNT.labels(request.method, route_path, response.status_code).inc()
        REQUEST_LATENCY.labels(request.method, route_path).observe(elapsed)
        response.headers["x-request-id"] = request_id
        logging.getLogger("awair.http").info(
            json.dumps(
                {
                    "event": "request_completed",
                    "request_id": request_id,
                    "method": request.method,
                    "route": route_path,
                    "status": response.status_code,
                    "duration_ms": round(elapsed * 1000, 2),
                }
            )
        )
        return response


def metrics_response() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
