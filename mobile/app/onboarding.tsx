import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { completeOnboarding } from '@/src/storage/history';
import { palette } from '@/src/theme';

const steps = [
  ['Masukkan kondisi', 'Isi cuaca, jam, lalu lintas, dan aktivitas industri di sekitar Anda.'],
  ['Lihat estimasi', 'AWAIR menampilkan estimasi AQI dan enam polutan dari model lokal.'],
  ['Buka kembali', 'Hasil tersimpan di backend dan dicache agar riwayat tetap dapat dibaca offline.'],
];

export default function OnboardingScreen() {
  const start = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <BrandMark />
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>LOCAL AIR QUALITY COMPANION</Text>
          <Text style={styles.title}>Understand the air around you.</Text>
          <Text style={styles.description}>
            AWAIR menghubungkan aplikasi mobile dengan pipeline machine learning melalui API lokal yang dapat diuji.
          </Text>
        </View>
        <View style={styles.steps}>
          {steps.map(([title, body], index) => (
            <View key={title} style={styles.step}>
              <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.notice}>Hasil bersifat demonstratif dan bukan saran kesehatan.</Text>
          <PrimaryButton label="Mulai menggunakan AWAIR" onPress={start} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas },
  container: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', padding: 24, gap: 28 },
  hero: { gap: 10, marginTop: 14 },
  eyebrow: { color: palette.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: palette.ink, fontSize: 39, lineHeight: 44, fontWeight: '900', maxWidth: 520 },
  description: { color: palette.muted, fontSize: 16, lineHeight: 24, maxWidth: 560 },
  steps: { gap: 18 },
  step: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  number: { width: 32, height: 32, borderRadius: 10, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: palette.primaryDark, fontWeight: '900' },
  stepCopy: { flex: 1, gap: 3 },
  stepTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  stepBody: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  footer: { marginTop: 'auto', gap: 12 },
  notice: { color: palette.muted, fontSize: 12, textAlign: 'center' },
});
