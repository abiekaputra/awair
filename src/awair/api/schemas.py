from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    temperature_c: float = Field(ge=-20, le=60)
    humidity_pct: float = Field(ge=0, le=100)
    wind_speed_mps: float = Field(ge=0, le=30)
    hour: int = Field(ge=0, le=23)
    traffic_index: float = Field(ge=0, le=1)
    industrial_index: float = Field(ge=0, le=1)


class PredictionResponse(BaseModel):
    id: str
    created_at: str
    inputs: PredictionRequest
    pollutants: dict[str, float]
    aqi: float
    category: str
    model_version: str


class HealthResponse(BaseModel):
    status: str
    service: str


class ReadinessResponse(BaseModel):
    ready: bool
    model_version: str | None = None
    database_ready: bool


class PredictionHistoryResponse(BaseModel):
    items: list[PredictionResponse]
