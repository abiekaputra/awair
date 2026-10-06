CONTEXT_FEATURES = [
    "temperature_c",
    "humidity_pct",
    "wind_speed_mps",
    "hour",
    "traffic_index",
    "industrial_index",
]

POLLUTANT_TARGETS = ["pm25", "pm10", "no2", "so2", "co", "o3"]
AQI_TARGET = "aqi"
TIMESTAMP_COLUMN = "timestamp"


def aqi_category(value: float) -> str:
    if value <= 50:
        return "Good"
    if value <= 100:
        return "Moderate"
    if value <= 150:
        return "Unhealthy for Sensitive Groups"
    if value <= 200:
        return "Unhealthy"
    if value <= 300:
        return "Very Unhealthy"
    return "Hazardous"
