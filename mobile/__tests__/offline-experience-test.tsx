import { render } from '@testing-library/react-native';
import * as mockReact from 'react';

import HistoryScreen from '@/app/(tabs)/history';
import PredictionScreen from '@/app/(tabs)/index';
import { getPredictions } from '@/src/api/client';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (callback: () => void | (() => void)) => {
    mockReact.useEffect(callback, [callback]);
  },
}));

jest.mock('@/src/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => false }));

jest.mock('@/src/api/client', () => ({
  ApiError: class ApiError extends Error {},
  createPrediction: jest.fn(),
  getPredictions: jest.fn(),
}));

jest.mock('@/src/storage/history', () => ({
  cachePrediction: jest.fn(),
  readCachedHistory: jest.fn().mockResolvedValue([
    {
      id: 'cached-prediction',
      created_at: '2026-10-06T05:48:53+00:00',
      inputs: {
        temperature_c: 30,
        humidity_pct: 70,
        wind_speed_mps: 2.5,
        hour: 8,
        traffic_index: 0.5,
        industrial_index: 0.3,
      },
      pollutants: { pm25: 40, pm10: 55, no2: 21, so2: 10, co: 1.2, o3: 18 },
      aqi: 69.93,
      category: 'Moderate',
      model_version: 'model-v1',
    },
  ]),
  writeCachedHistory: jest.fn(),
}));

describe('offline mobile experience', () => {
  it('shows cached history without requesting the API', async () => {
    const view = render(<HistoryScreen />);

    expect(await view.findByText('Menampilkan riwayat yang tersimpan di perangkat.')).toBeTruthy();
    expect(view.getByLabelText('Buka prediksi AQI 69.93')).toBeTruthy();
    expect(getPredictions).not.toHaveBeenCalled();
  });

  it('disables new predictions and explains the offline state', () => {
    const view = render(<PredictionScreen />);

    expect(view.getByText('Offline — riwayat cache tetap tersedia.')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Hitung estimasi' }).props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
    });
  });
});
