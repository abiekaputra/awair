import { createPrediction, getPredictions } from '@/src/api/client';
import type { Prediction } from '@/src/types';

const prediction: Prediction = {
  id: 'prediction-1',
  created_at: '2026-10-06T02:00:00+00:00',
  inputs: {
    temperature_c: 30,
    humidity_pct: 70,
    wind_speed_mps: 2.5,
    hour: 8,
    traffic_index: 0.5,
    industrial_index: 0.3,
  },
  pollutants: { pm25: 40, pm10: 55, no2: 21, so2: 10, co: 1.2, o3: 18 },
  aqi: 92,
  category: 'Moderate',
  model_version: 'model-v1',
};

describe('AWAIR API client', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('sends the mobile retry key and returns a prediction', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => prediction,
    } as Response);

    await expect(createPrediction(prediction.inputs, 'retry-1')).resolves.toEqual(prediction);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/predict'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Idempotency-Key': 'retry-1' }),
      }),
    );
  });

  it('returns typed server errors without leaking response internals', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'Prediction history is unavailable.' }),
    } as Response);

    await expect(getPredictions()).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiError',
        message: 'Prediction history is unavailable.',
        status: 503,
      }),
    );
  });

  it('maps network failures to a user-facing message', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('socket detail'));

    await expect(getPredictions()).rejects.toThrow('Tidak dapat terhubung ke AWAIR API.');
  });
});
