import { API_BASE_URL } from '@/src/config';
import type { Prediction, PredictionHistory, PredictionInput } from '@/src/types';

const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...options?.headers },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(body.detail || 'AWAIR tidak dapat memproses permintaan.', response.status);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Permintaan terlalu lama. Periksa koneksi lalu coba lagi.');
    }
    throw new ApiError('Tidak dapat terhubung ke AWAIR API.');
  } finally {
    clearTimeout(timeout);
  }
}

export function createPrediction(
  input: PredictionInput,
  idempotencyKey: string,
): Promise<Prediction> {
  return request('/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(input),
  });
}

export function getPredictions(limit = 50): Promise<PredictionHistory> {
  return request(`/predictions?limit=${limit}`);
}

export function getPrediction(id: string): Promise<Prediction> {
  return request(`/predictions/${encodeURIComponent(id)}`);
}
