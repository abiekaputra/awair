import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { palette } from '@/src/theme';

const icon = (name: SymbolViewProps['name'], color: ColorValue) => (
  <SymbolView name={name} tintColor={color} size={23} />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: { height: 66, paddingTop: 7, paddingBottom: 8, borderTopColor: palette.border },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Prediksi',
          tabBarIcon: ({ color }) => icon({ ios: 'wind', android: 'air', web: 'air' }, color),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color }) =>
            icon({ ios: 'clock', android: 'history', web: 'history' }, color),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Tentang',
          tabBarIcon: ({ color }) =>
            icon({ ios: 'info.circle', android: 'info', web: 'info' }, color),
        }}
      />
    </Tabs>
  );
}
