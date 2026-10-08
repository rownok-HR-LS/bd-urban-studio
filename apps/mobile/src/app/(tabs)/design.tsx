import { radius, space } from '@bdu/core';
import { Camera, HeartHandshake, Sparkles, Truck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, Screen } from '@/components/ui';
import { usePrefs } from '@/lib/preferences';

// Phase 2 replaces this with the intake wizard → photo → AI design flow.
export default function DesignScreen() {
  const { colors, t } = usePrefs();
  const steps = [
    { icon: Camera, label: t((d) => d.home.step1Body) },
    { icon: Sparkles, label: t((d) => d.home.step2Body) },
    { icon: Truck, label: t((d) => d.home.step3Body) },
    { icon: HeartHandshake, label: t((d) => d.home.step4Body) },
  ];
  return (
    <Screen>
      <AppText variant="title" style={{ marginTop: space.lg }}>
        {t((d) => d.design.title)}
      </AppText>
      <AppText color={colors.inkSoft} style={{ marginTop: space.sm }}>
        {t((d) => d.design.intro)}
      </AppText>
      <Card tone="sun" style={{ marginTop: space.xl, gap: space.md }}>
        <Badge tone="sun" label={t((d) => d.common.comingSoon)} />
        {steps.map(({ icon: Icon, label }, i) => (
          <View key={i} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.surface }]}>
              <Icon size={18} color={colors.warning} />
            </View>
            <AppText variant="small" style={{ flex: 1 }}>
              {label}
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
