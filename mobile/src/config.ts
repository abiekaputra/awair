import Constants from 'expo-constants';

const configuredUrl = process.env.EXPO_PUBLIC_AWAIR_API_URL;

export const API_BASE_URL = (configuredUrl || 'http://127.0.0.1:8000').replace(/\/$/, '');
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
