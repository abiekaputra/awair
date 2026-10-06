import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/src/theme';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row} accessibilityLabel="AWAIR">
      <View style={[styles.mark, compact && styles.compactMark]}>
        <View style={styles.waveOne} />
        <View style={styles.waveTwo} />
      </View>
      {!compact && <Text style={styles.wordmark}>AWAIR</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compactMark: { width: 34, height: 34, borderRadius: 11 },
  waveOne: {
    position: 'absolute',
    width: 36,
    height: 12,
    borderRadius: 12,
    backgroundColor: palette.accent,
    left: -6,
    top: 10,
    transform: [{ rotate: '-12deg' }],
  },
  waveTwo: {
    position: 'absolute',
    width: 30,
    height: 9,
    borderRadius: 10,
    backgroundColor: palette.surface,
    right: -5,
    bottom: 9,
    transform: [{ rotate: '-12deg' }],
  },
  wordmark: { color: palette.ink, fontWeight: '900', fontSize: 21, letterSpacing: 2 },
});
