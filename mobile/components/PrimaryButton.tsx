import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { palette } from '@/src/theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: Props) {
  const inactive = loading || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.surface} />
      ) : (
        <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  secondary: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.primary },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.9 },
  label: { color: palette.surface, fontSize: 15, fontWeight: '800' },
  secondaryLabel: { color: palette.primary },
});
