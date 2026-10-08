import { bundlePrice, formatPrice, localDigits, pick, radius, space } from '@bdu/core';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Sun } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Illustration } from '@/components/illustration';
import { AppText, Badge, Button, Card, Screen } from '@/components/ui';
import { useCatalog } from '@/lib/catalog';
import { usePrefs } from '@/lib/preferences';

export default function BundleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bundles, byId } = useCatalog();
  const { colors, locale, t } = usePrefs();
  const bundle = bundles.find((b) => b.id === id);

  if (!bundle) {
    return (
      <Screen>
        <AppText center style={{ marginTop: space.xxxl }}>
          {t((d) => d.common.loading)}
        </AppText>
      </Screen>
    );
  }

  const { full, final } = bundlePrice(bundle, byId);
  const anyOut = bundle.items.some((i) => (byId.get(i.product_id)?.stock ?? 0) < i.quantity);

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: pick(bundle.name, locale) }} />
      <Card tone="primary" style={styles.hero}>
        <View style={styles.art}>
          {bundle.items.slice(0, 4).map((i) => {
            const p = byId.get(i.product_id);
            return p ? <Illustration key={p.id} spec={p.illustration} size={84} /> : null;
          })}
        </View>
      </Card>
      <View style={{ gap: space.sm, marginTop: space.xl }}>
        <Badge tone="accent" label={t((d) => d.shop.bundleSave, { pct: bundle.discount_pct })} />
        <AppText variant="title">{pick(bundle.name, locale)}</AppText>
        <AppText color={colors.inkSoft}>{pick(bundle.description, locale)}</AppText>
        <View style={styles.row}>
          <Sun size={16} color={colors.warning} />
          <AppText variant="small" color={colors.muted}>
            {t((d) => d.product.sunRange, { min: bundle.min_sun_hours, max: bundle.max_sun_hours })}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="title" color={colors.primary}>
            {formatPrice(final, locale)}
          </AppText>
          <AppText color={colors.muted} style={{ textDecorationLine: 'line-through' }}>
            {formatPrice(full, locale)}
          </AppText>
        </View>
      </View>

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        {bundle.items.map((item) => {
          const p = byId.get(item.product_id);
          if (!p) return null;
          return (
            <Link key={p.id} href={{ pathname: '/product/[id]', params: { id: p.id } }} asChild>
              <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.item, { backgroundColor: colors.surface, borderColor: colors.line }])}>
                <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]}>
                  <Illustration spec={p.illustration} size={48} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="small" weight="bold">
                    {pick(p.name, locale)}
                  </AppText>
                  <AppText variant="tiny" color={colors.muted}>
                    {localDigits(item.quantity, locale)} × {formatPrice(p.price, locale)}
                  </AppText>
                </View>
                {p.stock < item.quantity && <Badge tone="danger" label={t((d) => d.common.outOfStock)} />}
              </Pressable>
            </Link>
          );
        })}
      </View>

      <Button label={t((d) => d.shop.addToCart)} disabled={anyOut} style={{ marginTop: space.xl }} />
      <AppText variant="tiny" color={colors.muted} center style={{ marginTop: space.sm }}>
        {t((d) => d.common.comingSoon)}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: space.sm, borderRadius: radius.xl },
  art: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm, borderRadius: radius.md, borderWidth: 1 },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
