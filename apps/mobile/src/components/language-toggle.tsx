import { radius } from '@bdu/core';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { usePrefs } from '@/lib/preferences';

/** Compact EN | বাং switch. Each label is written in its own language. */
export function LanguageToggle() {
  const { locale, setLocale, colors } = usePrefs();
  const options = [
    { value: 'en', label: 'EN', a11y: 'English' },
    { value: 'bn', label: 'বাং', a11y: 'বাংলা' },
  ] as const;
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.line }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = locale === o.value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={o.a11y}
            accessibilityState={{ selected }}
            onPress={() => setLocale(o.value)}
            style={[styles.option, selected && { backgroundColor: colors.primary }]}>
            <AppText variant="small" weight="bold" color={selected ? colors.primaryInk : colors.inkSoft}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.pill, borderWidth: 1, padding: 3 },
  option: { minWidth: 44, minHeight: 32, paddingHorizontal: 10, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
