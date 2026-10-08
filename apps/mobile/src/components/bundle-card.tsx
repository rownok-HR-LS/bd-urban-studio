import { bundlePrice, formatPrice, pick, radius, space, type Bundle } from '@bdu/core';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Illustration } from '@/components/illustration';
import { AppText, Badge } from '@/components/ui';
import { useCatalog } from '@/lib/catalog';
import { usePrefs } from '@/lib/preferences';

export function BundleCard({ bundle, width = 240 }: { bundle: Bundle; width?: number }) {
  const { colors, locale, t } = usePrefs();
  const { byId } = useCatalog();
  const { full, final } = bundlePrice(bundle, byId);
  const previews = bundle.items.slice(0, 3).map((i) => byId.get(i.product_id)).filter((p) => p !== undefined);
  return (
    <Link href={{ pathname: '/bundle/[id]', params: { id: bundle.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        style={StyleSheet.flatten([styles.card, { width, backgroundColor: colors.surface, borderColor: colors.line }])}>
        <View style={[styles.art, { backgroundColor: colors.primarySoft }]}>
          {previews.map((p) => (
            <Illustration key={p.id} spec={p.illustration} size={72} />
          ))}
        </View>
        <View style={styles.body}>
          <Badge tone="accent" label={t((d) => d.shop.bundleSave, { pct: bundle.discount_pct })} />
          <AppText weight="bold" numberOfLines={2}>
            {pick(bundle.name, locale)}
          </AppText>
          <AppText variant="small" color={colors.muted} numberOfLines={2}>
            {pick(bundle.description, locale)}
          </AppText>
          <View style={styles.priceRow}>
            <AppText weight="bold" color={colors.primary}>
              {formatPrice(final, locale)}
            </AppText>
            <AppText variant="small" color={colors.muted} style={{ textDecorationLine: 'line-through' }}>
              {formatPrice(full, locale)}
            </AppText>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  art: { height: 110, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6 },
  body: { padding: space.md, gap: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginTop: 2 },
});
