import type { KeyboardTypeOptions } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { palette } from '@/src/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hint: string;
  suffix?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
};

export function FormField({
  label,
  value,
  onChangeText,
  hint,
  suffix,
  error,
  keyboardType = 'decimal-pad',
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error && styles.inputError]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={styles.input}
          placeholderTextColor={palette.muted}
          returnKeyType="done"
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      <Text style={[styles.hint, error && styles.error]}>{error || hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 145, gap: 6 },
  label: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  inputRow: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputError: { borderColor: palette.danger },
  input: { flex: 1, color: palette.ink, fontSize: 16, paddingVertical: 12 },
  suffix: { color: palette.muted, fontSize: 13 },
  hint: { color: palette.muted, fontSize: 12, lineHeight: 16 },
  error: { color: palette.danger },
});
