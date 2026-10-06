import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/src/theme';

type Tone = 'info' | 'warning' | 'danger';

export function StatusBanner({ message, tone = 'info' }: { message: string; tone?: Tone }) {
  return (
    <View style={[styles.banner, styles[tone]]} accessibilityRole="alert">
      <Text style={[styles.text, styles[`${tone}Text`]]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  text: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  info: { backgroundColor: '#EFF8FF', borderColor: '#B2DDFF' },
  warning: { backgroundColor: '#FFFAEB', borderColor: '#FEDF89' },
  danger: { backgroundColor: '#FEF3F2', borderColor: '#FECDCA' },
  infoText: { color: palette.info },
  warningText: { color: palette.warning },
  dangerText: { color: palette.danger },
});
