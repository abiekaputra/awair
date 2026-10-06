import { StyleSheet, Text, View } from 'react-native';

import { categoryColors, palette } from '@/src/theme';
import type { Prediction } from '@/src/types';

const pollutantLabels: Record<string, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  no2: 'NO₂',
  so2: 'SO₂',
  co: 'CO',
  o3: 'O₃',
};

export function PredictionSummary({ prediction }: { prediction: Prediction }) {
  const color = categoryColors[prediction.category] || palette.primary;
  return (
    <View style={styles.card} accessibilityLabel={`AQI ${prediction.aqi}, ${prediction.category}`}>
      <View style={styles.resultHeader}>
        <View>
          <Text style={styles.eyebrow}>ESTIMASI AQI</Text>
          <Text style={[styles.aqi, { color }]}>{prediction.aqi}</Text>
        </View>
        <View style={[styles.category, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.categoryText, { color }]}>{prediction.category}</Text>
        </View>
      </View>
      <Text style={styles.disclaimer}>
        Hasil model sintetis untuk demonstrasi engineering, bukan panduan kesehatan resmi.
      </Text>
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Estimasi polutan</Text>
      <View style={styles.pollutants}>
        {Object.entries(prediction.pollutants).map(([name, value]) => (
          <View key={name} style={styles.metric}>
            <Text style={styles.metricLabel}>{pollutantLabels[name] || name}</Text>
            <Text style={styles.metricValue}>{value}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.metadata}>Model {prediction.model_version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    gap: 14,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  eyebrow: { color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  aqi: { fontSize: 48, lineHeight: 54, fontWeight: '900' },
  category: { maxWidth: 190, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },
  categoryText: { fontSize: 12, lineHeight: 16, fontWeight: '800', textAlign: 'center' },
  disclaimer: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  divider: { height: 1, backgroundColor: palette.border },
  sectionTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  pollutants: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { width: '30%', minWidth: 86, backgroundColor: palette.canvas, borderRadius: 14, padding: 12 },
  metricLabel: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  metricValue: { color: palette.ink, fontSize: 18, fontWeight: '800', marginTop: 4 },
  metadata: { color: palette.muted, fontSize: 11 },
});
