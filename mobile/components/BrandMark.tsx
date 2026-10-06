import { Image, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/src/theme';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row} accessibilityLabel="AWAIR">
      <Image
        source={require('../assets/images/brand-mark.png')}
        style={[styles.mark, compact && styles.compactMark]}
        resizeMode="contain"
      />
      {!compact && <Text style={styles.wordmark}>AWAIR</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 48,
    height: 44,
  },
  compactMark: { width: 38, height: 34 },
  wordmark: { color: palette.ink, fontWeight: '900', fontSize: 21, letterSpacing: 2 },
});
