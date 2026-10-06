import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  cachePrediction,
  completeOnboarding,
  hasCompletedOnboarding,
  readCachedHistory,
  writeCachedHistory,
} from '@/src/storage/history';
import type { Prediction } from '@/src/types';

const record = (id: string): Prediction => ({
  id,
  created_at: '2026-10-06T02:00:00+00:00',
  inputs: {
    temperature_c: 30,
    humidity_pct: 70,
    wind_speed_mps: 2,
    hour: 8,
    traffic_index: 0.5,
    industrial_index: 0.3,
  },
  pollutants: { pm25: 40, pm10: 55, no2: 21, so2: 10, co: 1.2, o3: 18 },
  aqi: 92,
  category: 'Moderate',
  model_version: 'model-v1',
});

describe('offline history storage', () => {
  beforeEach(() => AsyncStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it('keeps newest records first without duplicates', async () => {
    await writeCachedHistory([record('older')]);
    await cachePrediction(record('newer'));
    await cachePrediction(record('older'));

    const result = await readCachedHistory();

    expect(result.map((item) => item.id)).toEqual(['older', 'newer']);
  });

  it('recovers from invalid cached JSON', async () => {
    await AsyncStorage.setItem('awair:prediction-history:v1', '{broken');

    await expect(readCachedHistory()).resolves.toEqual([]);
  });

  it('persists onboarding completion', async () => {
    await expect(hasCompletedOnboarding()).resolves.toBe(false);
    await completeOnboarding();
    await expect(hasCompletedOnboarding()).resolves.toBe(true);
  });

  it('fails safely when device storage is unavailable', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(readCachedHistory()).resolves.toEqual([]);

    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(writeCachedHistory([record('record-1')])).resolves.toBe(false);
  });
});
