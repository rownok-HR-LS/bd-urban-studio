import { Tabs } from 'expo-router';
import { House, ShoppingBag, Sparkles, Sprout, UserRound } from 'lucide-react-native';

import { usePrefs } from '@/lib/preferences';

export default function TabLayout() {
  const { colors, t, bodyFont } = usePrefs();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 68, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: bodyFont('medium'), fontSize: 11, lineHeight: 16, marginBottom: 6 },
      }}>
      <Tabs.Screen name="index" options={{ title: t((d) => d.tabs.home), tabBarIcon: ({ color }) => <House size={22} color={color} /> }} />
      <Tabs.Screen name="shop" options={{ title: t((d) => d.tabs.shop), tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} /> }} />
      <Tabs.Screen name="design" options={{ title: t((d) => d.tabs.design), tabBarIcon: ({ color }) => <Sparkles size={22} color={color} /> }} />
      <Tabs.Screen name="garden" options={{ title: t((d) => d.tabs.garden), tabBarIcon: ({ color }) => <Sprout size={22} color={color} /> }} />
      <Tabs.Screen name="account" options={{ title: t((d) => d.tabs.account), tabBarIcon: ({ color }) => <UserRound size={22} color={color} /> }} />
    </Tabs>
  );
}
