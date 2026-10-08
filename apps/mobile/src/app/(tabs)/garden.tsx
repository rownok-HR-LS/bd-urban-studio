import { space } from '@bdu/core';
import { Sprout } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText, Card, Screen } from '@/components/ui';
import { usePrefs } from '@/lib/preferences';

// Phase 5 fills this with the customer's plants, care calendar, health score,
// weather alerts and plant doctor.
export default function GardenScreen() {
  const { colors, t } = usePrefs();
  return (
    <Screen>
      <AppText variant="title" style={{ marginTop: space.lg }}>
        {t((d) => d.garden.title)}
      </AppText>
      <Card tone="primary" style={{ marginTop: space.xl, alignItems: 'center', gap: space.md, paddingVertical: space.xxl }}>
        <View style={{ backgroundColor: colors.surface, borderRadius: 999, padding: space.lg }}>
          <Sprout size={32} color={colors.primary} />
        </View>
        <AppText center color={colors.inkSoft}>
          {t((d) => d.garden.empty)}
        </AppText>
      </Card>
    </Screen>
  );
}
