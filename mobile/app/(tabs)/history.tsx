import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { HistoryCard } from '@/components/HistoryCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StatusBanner } from '@/components/StatusBanner';
import { ApiError, getPredictions } from '@/src/api/client';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { readCachedHistory, writeCachedHistory } from '@/src/storage/history';
import { palette } from '@/src/theme';
import type { Prediction } from '@/src/types';

export default function HistoryScreen() {
  const isOnline = useNetworkStatus();
  const [records, setRecords] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setMessage(null);
    try {
      const cached = await readCachedHistory();
      setRecords(cached);
      setFromCache(true);
      if (isOnline === true) {
        const response = await getPredictions();
        setRecords(response.items);
        setFromCache(false);
        await writeCachedHistory(response.items);
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Riwayat tidak dapat dimuat.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen
      title="Prediction history"
      description="Hasil terbaru dari backend lokal, dengan cache untuk akses saat koneksi terputus."
      refreshing={refreshing}
      onRefresh={() => load(true)}>
      {fromCache && records.length > 0 && (
        <StatusBanner tone="warning" message="Menampilkan riwayat yang tersimpan di perangkat." />
      )}
      {message && <StatusBanner tone="danger" message={message} />}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.loadingText}>Memuat riwayat…</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Belum ada prediksi</Text>
          <Text style={styles.emptyBody}>Buat estimasi pertama Anda dari tab Prediksi.</Text>
          <PrimaryButton label="Buat prediksi" onPress={() => router.push('/(tabs)')} />
        </View>
      ) : (
        <View style={styles.list}>
          {records.map((record) => (
            <HistoryCard
              key={record.id}
              prediction={record}
              onPress={() => router.push({ pathname: '/prediction/[id]', params: { id: record.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  loadingText: { color: palette.muted, fontSize: 13 },
  empty: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    padding: 24,
    gap: 12,
  },
  emptyTitle: { color: palette.ink, fontSize: 18, fontWeight: '800' },
  emptyBody: { color: palette.muted, fontSize: 14, lineHeight: 21 },
  list: { gap: 12 },
});
