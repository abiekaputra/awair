import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { palette } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.canvas },
          headerTintColor: palette.ink,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.canvas },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="prediction/[id]" options={{ title: 'Detail prediksi' }} />
      </Stack>
    </>
  );
}
