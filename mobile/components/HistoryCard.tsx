import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryColors, palette } from '@/src/theme';
import type { Prediction } from '@/src/types';

export function HistoryCard({ prediction, onPress }: { prediction: Prediction; onPress: () => void }) {
  const color = categoryColors[prediction.category] || palette.primary;
  const timestamp = new Date(prediction.created_at).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Buka prediksi AQI ${prediction.aqi}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.score, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.scoreValue, { color }]}>{Math.round(prediction.aqi)}</Text>
        <Text style={[styles.scoreLabel, { color }]}>AQI</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={2}>{prediction.category}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 14,
  },
  pressed: { opacity: 0.75 },
  score: { width: 62, height: 62, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontSize: 22, fontWeight: '900' },
  scoreLabel: { fontSize: 10, fontWeight: '800' },
  body: { flex: 1, gap: 5 },
  category: { color: palette.ink, fontSize: 15, lineHeight: 20, fontWeight: '800' },
  timestamp: { color: palette.muted, fontSize: 12 },
  chevron: { color: palette.muted, fontSize: 28, fontWeight: '300' },
});
