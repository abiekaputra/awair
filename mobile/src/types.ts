export type PredictionInput = {
  temperature_c: number;
  humidity_pct: number;
  wind_speed_mps: number;
  hour: number;
  traffic_index: number;
  industrial_index: number;
};

export type Pollutants = {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
};

export type Prediction = {
  id: string;
  created_at: string;
  inputs: PredictionInput;
  pollutants: Pollutants;
  aqi: number;
  category: string;
  model_version: string;
};

export type PredictionHistory = {
  items: Prediction[];
};

export type PredictionForm = Record<keyof PredictionInput, string>;
