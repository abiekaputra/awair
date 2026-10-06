import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Prediction } from '@/src/types';

const HISTORY_KEY = 'awair:prediction-history:v1';
const ONBOARDING_KEY = 'awair:onboarding-complete:v1';
const MAX_CACHED_RECORDS = 50;

export async function readCachedHistory(): Promise<Prediction[]> {
  try {
    const serialized = await AsyncStorage.getItem(HISTORY_KEY);
    if (!serialized) return [];
    const parsed = JSON.parse(serialized);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeCachedHistory(records: Prediction[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_CACHED_RECORDS)));
    return true;
  } catch {
    return false;
  }
}

export async function cachePrediction(record: Prediction): Promise<boolean> {
  const current = await readCachedHistory();
  const withoutDuplicate = current.filter((item) => item.id !== record.id);
  return writeCachedHistory([record, ...withoutDuplicate]);
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function completeOnboarding(): Promise<boolean> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}
