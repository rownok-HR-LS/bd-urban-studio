import { space } from '@bdu/core';
import { Languages, Moon, Phone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { LanguageToggle } from '@/components/language-toggle';
import { AppText, Button, Card, Chip, Screen } from '@/components/ui';
import { usePrefs, type AppearancePref } from '@/lib/preferences';

export default function AccountScreen() {
  const { colors, t, appearance, setAppearance, locale } = usePrefs();
  const appearanceLabels: Record<AppearancePref, string> =
    locale === 'bn' ? { system: 'সিস্টেম', light: 'আলো', dark: 'অন্ধকার' } : { system: 'System', light: 'Light', dark: 'Dark' };

  return (
    <Screen>
      <AppText variant="title" style={{ marginTop: space.lg }}>
        {t((d) => d.account.title)}
      </AppText>

      <Card style={{ marginTop: space.xl, gap: space.md }}>
        <AppText color={colors.inkSoft}>{t((d) => d.account.guest)}</AppText>
        <Button label={t((d) => d.account.signIn)} icon={<Phone size={18} color={colors.primaryInk} />} disabled />
        <AppText variant="tiny" color={colors.muted} center>
          {t((d) => d.common.comingSoon)}
        </AppText>
      </Card>

      <Card style={{ marginTop: space.lg, gap: space.lg }}>
        <View style={styles.row}>
          <Languages size={20} color={colors.primary} />
          <AppText weight="bold" style={{ flex: 1 }}>
            {t((d) => d.common.language)}
          </AppText>
          <LanguageToggle />
        </View>
        <View style={{ gap: space.sm }}>
          <View style={styles.row}>
            <Moon size={20} color={colors.primary} />
            <AppText weight="bold">{t((d) => d.account.appearance)}</AppText>
          </View>
          <View style={styles.chips}>
            {(['system', 'light', 'dark'] as const).map((pref) => (
              <Chip key={pref} label={appearanceLabels[pref]} selected={appearance === pref} onPress={() => setAppearance(pref)} />
            ))}
          </View>
        </View>
      </Card>

      <AppText variant="tiny" color={colors.muted} center style={{ marginTop: space.xl }}>
        {t((d) => d.brand.name)} · v0.1
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  chips: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
});
