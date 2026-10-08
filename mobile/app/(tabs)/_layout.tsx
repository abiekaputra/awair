import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { palette } from '@/src/theme';

const icon = (label: string, color: ColorValue) => (
  <Text accessibilityElementsHidden style={{ color, fontSize: 19, fontWeight: '800' }}>
    {label}
  </Text>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          height: 66,
          paddingTop: 7,
          paddingBottom: 8,
          borderTopColor: palette.border,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Prediksi',
          tabBarIcon: ({ color }) => icon('≈', color),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color }) => icon('◷', color),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Tentang',
          tabBarIcon: ({ color }) => icon('i', color),
        }}
      />
    </Tabs>
  );
}
