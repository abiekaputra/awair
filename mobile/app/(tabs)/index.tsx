import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { PredictionSummary } from '@/components/PredictionSummary';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StatusBanner } from '@/components/StatusBanner';
import { ApiError, createPrediction } from '@/src/api/client';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { cachePrediction } from '@/src/storage/history';
import { palette } from '@/src/theme';
import type { Prediction, PredictionForm, PredictionInput } from '@/src/types';
import {
  defaultForm,
  makeIdempotencyKey,
  validatePredictionForm,
} from '@/src/validation/prediction';

type Attempt = { input: PredictionInput; key: string };
type Notice = { message: string; tone: 'danger' | 'warning' };

export default function PredictionScreen() {
  const isOnline = useNetworkStatus();
  const [form, setForm] = useState<PredictionForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PredictionInput, string>>>({});
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);

  const changeField = (key: keyof PredictionInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const runPrediction = async (nextAttempt: Attempt) => {
    if (isOnline === false) {
      setNotice({
        tone: 'warning',
        message: 'Perangkat sedang offline. Sambungkan ke jaringan API lokal untuk membuat prediksi.',
      });
      return;
    }
    setLoading(true);
    setNotice(null);
    setAttempt(nextAttempt);
    try {
      const result = await createPrediction(nextAttempt.input, nextAttempt.key);
      setPrediction(result);
      setAttempt(null);
      if (!(await cachePrediction(result))) {
        setNotice({
          tone: 'warning',
          message: 'Prediksi berhasil, tetapi cache perangkat tidak dapat diperbarui.',
        });
      }
    } catch (error) {
      setNotice({
        tone: 'danger',
        message: error instanceof ApiError ? error.message : 'Prediksi gagal diproses.',
      });
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    const validation = validatePredictionForm(form);
    setErrors(validation.errors);
    if (!validation.input) {
      setNotice({ tone: 'danger', message: 'Periksa kembali nilai yang ditandai.' });
      return;
    }
    runPrediction({ input: validation.input, key: makeIdempotencyKey() });
  };

  return (
    <Screen
      title="Check the air"
      description="Masukkan kondisi saat ini untuk mendapatkan estimasi yang dapat disimpan dan ditinjau kembali.">
      {isOnline === false && (
        <StatusBanner tone="warning" message="Offline — riwayat cache tetap tersedia." />
      )}
      {notice && <StatusBanner tone={notice.tone} message={notice.message} />}

      <View style={styles.formCard}>
        <SectionHeading title="Kondisi lingkungan" note="Semua kolom wajib diisi" />
        <View style={styles.grid}>
          <FormField
            label="Suhu"
            value={form.temperature_c}
            onChangeText={(value) => changeField('temperature_c', value)}
            hint="-20 hingga 60"
            suffix="°C"
            error={errors.temperature_c}
          />
          <FormField
            label="Kelembapan"
            value={form.humidity_pct}
            onChangeText={(value) => changeField('humidity_pct', value)}
            hint="0 hingga 100"
            suffix="%"
            error={errors.humidity_pct}
          />
          <FormField
            label="Kecepatan angin"
            value={form.wind_speed_mps}
            onChangeText={(value) => changeField('wind_speed_mps', value)}
            hint="0 hingga 30"
            suffix="m/s"
            error={errors.wind_speed_mps}
          />
          <FormField
            label="Jam"
            value={form.hour}
            onChangeText={(value) => changeField('hour', value)}
            hint="0 hingga 23"
            error={errors.hour}
            keyboardType="number-pad"
          />
        </View>
        <SectionHeading title="Konteks aktivitas" note="Gunakan skala 0–1" />
        <View style={styles.grid}>
          <FormField
            label="Indeks lalu lintas"
            value={form.traffic_index}
            onChangeText={(value) => changeField('traffic_index', value)}
            hint="0 sepi · 1 sangat padat"
            error={errors.traffic_index}
          />
          <FormField
            label="Indeks industri"
            value={form.industrial_index}
            onChangeText={(value) => changeField('industrial_index', value)}
            hint="0 rendah · 1 sangat tinggi"
            error={errors.industrial_index}
          />
        </View>
        <PrimaryButton
          label="Hitung estimasi"
          onPress={submit}
          loading={loading}
          disabled={isOnline === false}
        />
        {attempt && !loading && (
          <PrimaryButton
            label="Coba lagi"
            onPress={() => runPrediction(attempt)}
            variant="secondary"
          />
        )}
      </View>

      {prediction && <PredictionSummary prediction={prediction} />}
    </Screen>
  );
}

function SectionHeading({ title, note }: { title: string; note: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionNote}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    gap: 18,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  sectionTitle: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  sectionNote: { color: palette.muted, fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
});
