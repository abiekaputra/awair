import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { hasCompletedOnboarding } from '@/src/storage/history';
import { palette } from '@/src/theme';

export default function EntryScreen() {
  useEffect(() => {
    hasCompletedOnboarding()
      .then((completed) => router.replace(completed ? '/(tabs)' : '/onboarding'))
      .catch(() => router.replace('/onboarding'));
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={palette.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.canvas },
});
