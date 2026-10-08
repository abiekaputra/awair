import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { palette } from '@/src/theme';

type Props = PropsWithChildren<{
  title: string;
  description?: string;
  action?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function Screen({
  title,
  description,
  action,
  refreshing = false,
  onRefresh,
  children,
}: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.primary}
            />
          ) : undefined
        }
      >
        <View style={styles.topbar}>
          <BrandMark />
          {action}
        </View>
        <View style={styles.heading}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.canvas },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 20,
  },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { gap: 6 },
  title: { color: palette.ink, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  description: { color: palette.muted, fontSize: 15, lineHeight: 22 },
});
