import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tidak ditemukan' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Halaman tidak ditemukan.</Text>
        <Link href="/(tabs)" style={styles.link}>Kembali ke AWAIR</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: palette.canvas },
  title: { color: palette.ink, fontSize: 18, fontWeight: '800' },
  link: { color: palette.primary, fontSize: 14, fontWeight: '700' },
});
