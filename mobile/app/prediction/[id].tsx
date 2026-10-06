import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PredictionSummary } from '@/components/PredictionSummary';
import { Screen } from '@/components/Screen';
import { StatusBanner } from '@/components/StatusBanner';
import { ApiError, getPrediction } from '@/src/api/client';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { cachePrediction, readCachedHistory } from '@/src/storage/history';
import { palette } from '@/src/theme';
import type { Prediction } from '@/src/types';

const inputLabels: Record<string, string> = {
  temperature_c: 'Suhu',
  humidity_pct: 'Kelembapan',
  wind_speed_mps: 'Kecepatan angin',
  hour: 'Jam',
  traffic_index: 'Indeks lalu lintas',
  industrial_index: 'Indeks industri',
};

export default function PredictionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isOnline = useNetworkStatus();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const cached = (await readCachedHistory()).find((item) => item.id === id);
      if (cached) setPrediction(cached);
      if (isOnline === null) return;
      if (isOnline === false) {
        if (!cached) setMessage('Detail ini belum tersedia di cache perangkat.');
        return;
      }
      try {
        const result = await getPrediction(id);
        setPrediction(result);
        await cachePrediction(result);
      } catch (error) {
        if (!cached) setMessage(error instanceof ApiError ? error.message : 'Detail tidak dapat dimuat.');
      }
    };
    load();
  }, [id, isOnline]);

  return (
    <Screen title="Prediction detail" description="Input, output, dan versi model untuk satu prediksi.">
      {message && <StatusBanner tone="danger" message={message} />}
      {!prediction ? (
        <ActivityIndicator style={styles.loading} color={palette.primary} size="large" />
      ) : (
        <>
          <PredictionSummary prediction={prediction} />
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Input yang digunakan</Text>
            {Object.entries(prediction.inputs).map(([name, value]) => (
              <View key={name} style={styles.row}>
                <Text style={styles.label}>{inputLabels[name] || name}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
            ))}
            <Text style={styles.id}>ID {prediction.id}</Text>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 80 },
  card: { backgroundColor: palette.surface, borderRadius: 22, borderWidth: 1, borderColor: palette.border, padding: 20, gap: 12 },
  sectionTitle: { color: palette.ink, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  label: { color: palette.muted, fontSize: 13 },
  value: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  id: { color: palette.muted, fontSize: 10, marginTop: 8 },
});
