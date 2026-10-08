import { formatPrice, localDigits, pick, radius, space, stockState, type Product } from '@bdu/core';
import { Link } from 'expo-router';
import { PawPrint, Sun } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Illustration } from '@/components/illustration';
import { AppText, Badge } from '@/components/ui';
import { useGridItemWidth } from '@/hooks/use-grid-width';
import { usePrefs } from '@/lib/preferences';

export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const { colors, locale, t } = usePrefs();
  const gridWidth = useGridItemWidth();
  const stock = stockState(product);
  const plant = product.plant;
  return (
    <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${pick(product.name, locale)}, ${formatPrice(product.price, locale)}`}
        style={StyleSheet.flatten([styles.card, { backgroundColor: colors.surface, borderColor: colors.line, width: width ?? gridWidth }])}>
        <View style={[styles.art, { backgroundColor: colors.surfaceAlt }]}>
          <Illustration spec={product.illustration} size={92} />
          {plant?.pet_safe && (
            <View style={[styles.corner, { backgroundColor: colors.primarySoft }]}>
              <PawPrint size={14} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.body}>
          <AppText variant="small" weight="bold" numberOfLines={2}>
            {pick(product.name, locale)}
          </AppText>
          {plant && (
            <View style={styles.row}>
              <Sun size={13} color={colors.warning} />
              <AppText variant="tiny" color={colors.muted}>
                {t((d) => d.common.hours, { count: localDigits(`${plant.min_sun_hours}–${plant.max_sun_hours}`, locale) })}
              </AppText>
            </View>
          )}
          <View style={[styles.row, { justifyContent: 'space-between', marginTop: 'auto' }]}>
            <AppText weight="bold" color={colors.primary}>
              {formatPrice(product.price, locale)}
            </AppText>
          </View>
          {stock !== 'in' && (
            <Badge
              tone={stock === 'out' ? 'danger' : 'sun'}
              label={stock === 'out' ? t((d) => d.common.outOfStock) : t((d) => d.common.lowStock, { count: product.stock })}
            />
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  art: { height: 120, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', top: 8, right: 8, borderRadius: radius.pill, padding: 5 },
  body: { padding: space.md, gap: 4, flexGrow: 1, minHeight: 104 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
