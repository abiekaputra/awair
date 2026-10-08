import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { API_BASE_URL, APP_VERSION } from '@/src/config';
import { palette } from '@/src/theme';

const facts = [
  ['Model', 'Random Forest pollutants → Linear Regression AQI'],
  ['Data', 'Synthetic and reproducible'],
  ['History', 'SQLite backend with local device cache'],
  ['API', API_BASE_URL],
];

export default function AboutScreen() {
  return (
    <Screen
      title="About AWAIR"
      description="An end-to-end mobile and machine learning portfolio product."
    >
      <View style={styles.heroCard}>
        <Text style={styles.quote}>“Useful evidence starts with honest limits.”</Text>
        <Text style={styles.body}>
          AWAIR menunjukkan bagaimana input pengguna mengalir menuju API, database, pipeline model,
          dan kembali sebagai hasil yang dapat dibaca serta ditinjau ulang.
        </Text>
      </View>
      <View style={styles.card}>
        {facts.map(([label, value]) => (
          <View key={label} style={styles.fact}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} selectable>
              {value}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Responsible use</Text>
        <Text style={styles.body}>
          Model bawaan dilatih memakai data sintetis. Estimasi tidak boleh digunakan untuk keputusan
          medis, regulasi, keadaan darurat, atau peringatan kualitas udara publik.
        </Text>
        <Text style={styles.body}>
          Payload prediksi tidak ditulis ke application log. Riwayat tersimpan pada database lokal
          backend dan cache privat aplikasi.
        </Text>
      </View>
      <Text style={styles.version}>AWAIR Mobile {APP_VERSION}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: palette.primaryDark, borderRadius: 22, padding: 22, gap: 12 },
  quote: { color: palette.accent, fontSize: 22, lineHeight: 29, fontWeight: '800' },
  body: { color: palette.muted, fontSize: 14, lineHeight: 22 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    gap: 16,
  },
  fact: { gap: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: palette.border },
  label: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: { color: palette.ink, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  sectionTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  version: { color: palette.muted, fontSize: 12, textAlign: 'center' },
});
