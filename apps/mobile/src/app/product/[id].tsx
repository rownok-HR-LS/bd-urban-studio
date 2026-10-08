import { formatPrice, localDigits, pick, radius, space, stockState, unitLabel, type Product, type Translate } from '@bdu/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  CloudRain,
  Droplets,
  Flame,
  Flower2,
  Leaf,
  PawPrint,
  Plug,
  Ruler,
  Sun,
  Utensils,
  Weight,
  Wind,
  Wrench,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { Illustration } from '@/components/illustration';
import { AppText, Badge, Button, Card, Screen } from '@/components/ui';
import { useCatalog } from '@/lib/catalog';
import { usePrefs } from '@/lib/preferences';

type Fact = { icon: ComponentType<{ size?: number; color?: string }>; label: string; value: string };

function facts(p: Product, t: Translate, locale: 'en' | 'bn'): Fact[] {
  const n = (v: number | string) => localDigits(v, locale);
  if (p.plant) {
    const s = p.plant;
    return [
      { icon: Sun, label: t((d) => d.product.sunlight), value: t((d) => d.product.sunRange, { min: s.min_sun_hours, max: s.max_sun_hours }) },
      {
        icon: Droplets,
        label: t((d) => d.product.water),
        value: s.water_every_days <= 1 ? t((d) => d.product.waterDaily) : t((d) => d.product.waterEvery, { days: s.water_every_days }),
      },
      { icon: Ruler, label: t((d) => d.product.size), value: t((d) => d.product.sizeValue, { height: s.mature_height_cm }) },
      { icon: Leaf, label: t((d) => d.product.care), value: t((d) => d.care[p.care_level]) },
    ];
  }
  const list: Fact[] = [];
  if (p.pot) {
    list.push({ icon: Ruler, label: t((d) => d.product.dimensions), value: `${n(p.pot.diameter_in)}" × ${n(p.pot.height_in)}"` });
    list.push({ icon: Leaf, label: t((d) => d.product.mount), value: t((d) => d.mount[p.pot!.mount]) });
  }
  if (p.hardware) {
    list.push({ icon: Ruler, label: t((d) => d.product.dimensions), value: n(p.hardware.dimensions_cm) });
  }
  if (p.weight_kg > 0) list.push({ icon: Weight, label: t((d) => d.product.weight), value: `${n(p.weight_kg)} kg` });
  return list;
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId } = useCatalog();
  const { colors, locale, t } = usePrefs();
  const product = byId.get(id);

  if (!product) {
    return (
      <Screen>
        <AppText center style={{ marginTop: space.xxxl }}>
          {t((d) => d.common.loading)}
        </AppText>
      </Screen>
    );
  }

  const stock = stockState(product);
  const s = product.plant;
  const traits: { show: boolean; icon: Fact['icon']; label: string; tone: 'primary' | 'sky' | 'sun' | 'accent' | 'danger' }[] = s
    ? [
        { show: s.pet_safe, icon: PawPrint, label: t((d) => d.product.petSafe), tone: 'primary' },
        { show: !s.pet_safe, icon: PawPrint, label: t((d) => d.product.notPetSafe), tone: 'danger' },
        { show: s.monsoon_tolerant, icon: CloudRain, label: t((d) => d.product.monsoon), tone: 'sky' },
        { show: s.heat_tolerant, icon: Flame, label: t((d) => d.product.heat), tone: 'sun' },
        { show: s.coastal_ok, icon: Wind, label: t((d) => d.product.coastal), tone: 'sky' },
        { show: s.edible, icon: Utensils, label: t((d) => d.product.edible), tone: 'accent' },
        { show: s.fragrant, icon: Flower2, label: t((d) => d.product.fragrant), tone: 'accent' },
      ]
    : [
        { show: !!product.pot?.drainage, icon: Droplets, label: t((d) => d.product.drainage), tone: 'sky' },
        { show: !!product.pot?.self_watering, icon: Droplets, label: t((d) => d.product.selfWatering), tone: 'primary' },
        { show: !!product.hardware?.needs_power, icon: Plug, label: t((d) => d.product.needsPower), tone: 'sun' },
        { show: !!product.hardware?.needs_drilling, icon: Wrench, label: t((d) => d.product.needsDrilling), tone: 'accent' },
        {
          show: !!product.hardware?.load_rating_kg,
          icon: Weight,
          label: t((d) => d.product.loadRating, { kg: product.hardware?.load_rating_kg ?? 0 }),
          tone: 'primary',
        },
      ];

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: pick(product.name, locale) }} />
      <View style={[styles.art, { backgroundColor: colors.surfaceAlt }]}>
        <Illustration spec={product.illustration} size={200} />
      </View>

      <View style={styles.titleBlock}>
        {s && (
          <AppText variant="small" color={colors.muted} style={{ fontStyle: 'italic' }}>
            {s.species}
          </AppText>
        )}
        <AppText variant="title">{pick(product.name, locale)}</AppText>
        <AppText color={colors.inkSoft}>{pick(product.description, locale)}</AppText>
        <View style={styles.priceRow}>
          <AppText variant="title" color={colors.primary}>
            {formatPrice(product.price, locale)}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            {t((d) => d.common.perUnit, { unit: unitLabel(product.unit, locale) })}
          </AppText>
        </View>
        <Badge
          tone={stock === 'out' ? 'danger' : stock === 'low' ? 'sun' : 'primary'}
          label={
            stock === 'out'
              ? t((d) => d.common.outOfStock)
              : stock === 'low'
                ? t((d) => d.common.lowStock, { count: product.stock })
                : t((d) => d.common.inStock)
          }
        />
      </View>

      <View style={styles.facts}>
        {facts(product, t, locale).map(({ icon: Icon, label, value }) => (
          <Card key={label} style={styles.fact}>
            <Icon size={20} color={colors.primary} />
            <AppText variant="tiny" color={colors.muted}>
              {label}
            </AppText>
            <AppText variant="small" weight="bold">
              {value}
            </AppText>
          </Card>
        ))}
      </View>

      <View style={styles.traits}>
        {traits
          .filter((x) => x.show)
          .map(({ icon: Icon, label, tone }) => (
            <Badge key={label} tone={tone} label={label} icon={<Icon size={12} color={tone === 'danger' ? colors.danger : colors.inkSoft} />} />
          ))}
        {s && <Badge tone="muted" label={t((d) => d.product.potSize, { size: s.pot_size_in })} />}
      </View>

      <Button
        label={t((d) => d.shop.addToCart)}
        disabled={stock === 'out'}
        style={{ marginTop: space.xl }}
        accessibilityLabel={`${t((d) => d.shop.addToCart)}: ${pick(product.name, locale)}`}
      />
      <AppText variant="tiny" color={colors.muted} center style={{ marginTop: space.sm }}>
        {t((d) => d.common.comingSoon)}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { height: 260, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  titleBlock: { gap: space.sm, marginTop: space.xl },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.xl },
  fact: { flexBasis: '46%', flexGrow: 1, gap: 4, padding: space.md },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
});
