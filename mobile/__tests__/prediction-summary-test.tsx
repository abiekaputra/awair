import { render } from '@testing-library/react-native';

import { PredictionSummary } from '@/components/PredictionSummary';

describe('PredictionSummary', () => {
  it('renders the result, pollutant values, and responsible-use copy', async () => {
    const view = await render(
      <PredictionSummary
        prediction={{
          id: 'prediction-1',
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
        }}
      />,
    );

    expect(view.getByLabelText('AQI 92, Moderate')).toBeTruthy();
    expect(view.getByText('PM2.5')).toBeTruthy();
    expect(view.getByText(/bukan panduan kesehatan resmi/)).toBeTruthy();
  });
});
