import { defaultForm, makeIdempotencyKey, validatePredictionForm } from '@/src/validation/prediction';

describe('prediction form validation', () => {
  it('converts valid form values into the API contract', () => {
    const result = validatePredictionForm(defaultForm);

    expect(result.errors).toEqual({});
    expect(result.input).toEqual({
      temperature_c: 30,
      humidity_pct: 70,
      wind_speed_mps: 2.5,
      hour: 8,
      traffic_index: 0.5,
      industrial_index: 0.3,
    });
  });

  it('rejects missing, out-of-range, and fractional hour values', () => {
    const result = validatePredictionForm({
      ...defaultForm,
      temperature_c: '',
      humidity_pct: '120',
      hour: '8.5',
    });

    expect(result.input).toBeUndefined();
    expect(result.errors.temperature_c).toContain('angka');
    expect(result.errors.humidity_pct).toContain('0 dan 100');
    expect(result.errors.hour).toContain('bilangan bulat');
  });

  it('creates distinct retry keys', () => {
    const first = makeIdempotencyKey();
    const second = makeIdempotencyKey();

    expect(first).toMatch(/^mobile-/);
    expect(second).not.toEqual(first);
  });
});
