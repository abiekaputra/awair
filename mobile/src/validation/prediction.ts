import type { PredictionForm, PredictionInput } from '@/src/types';

type FieldRule = {
  label: string;
  min: number;
  max: number;
  integer?: boolean;
};

export const defaultForm: PredictionForm = {
  temperature_c: '30',
  humidity_pct: '70',
  wind_speed_mps: '2.5',
  hour: '8',
  traffic_index: '0.5',
  industrial_index: '0.3',
};

const rules: Record<keyof PredictionInput, FieldRule> = {
  temperature_c: { label: 'Suhu', min: -20, max: 60 },
  humidity_pct: { label: 'Kelembapan', min: 0, max: 100 },
  wind_speed_mps: { label: 'Kecepatan angin', min: 0, max: 30 },
  hour: { label: 'Jam', min: 0, max: 23, integer: true },
  traffic_index: { label: 'Indeks lalu lintas', min: 0, max: 1 },
  industrial_index: { label: 'Indeks industri', min: 0, max: 1 },
};

export function validatePredictionForm(form: PredictionForm): {
  input?: PredictionInput;
  errors: Partial<Record<keyof PredictionInput, string>>;
} {
  const errors: Partial<Record<keyof PredictionInput, string>> = {};
  const input = {} as PredictionInput;

  (Object.keys(rules) as (keyof PredictionInput)[]).forEach((key) => {
    const value = Number(form[key].trim());
    const rule = rules[key];
    if (form[key].trim() === '' || !Number.isFinite(value)) {
      errors[key] = `${rule.label} harus berupa angka.`;
    } else if (value < rule.min || value > rule.max) {
      errors[key] = `${rule.label} harus antara ${rule.min} dan ${rule.max}.`;
    } else if (rule.integer && !Number.isInteger(value)) {
      errors[key] = `${rule.label} harus berupa bilangan bulat.`;
    } else {
      input[key] = value;
    }
  });

  return Object.keys(errors).length ? { errors } : { input, errors };
}

export function makeIdempotencyKey(): string {
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
