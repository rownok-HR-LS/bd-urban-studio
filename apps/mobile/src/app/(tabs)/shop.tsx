import { filterProducts, radius, space, type ProductCategory, type ShopFlag } from '@bdu/core';
import { Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ProductCard } from '@/components/product-card';
import { AppText, Chip, Screen } from '@/components/ui';
import { useCatalog } from '@/lib/catalog';
import { usePrefs } from '@/lib/preferences';

const CATEGORIES: (ProductCategory | 'all')[] = ['all', 'plant', 'pot', 'hardware', 'accessory'];
const FLAGS: ShopFlag[] = ['petSafe', 'lowLight', 'fullSun', 'edible', 'fragrant', 'monsoon', 'easy'];

export default function ShopScreen() {
  const { colors, t, bodyFont, locale } = usePrefs();
  const { products } = useCatalog();
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [flags, setFlags] = useState<ShopFlag[]>([]);
  const [text, setText] = useState('');

  const plantOnly = category === 'all' || category === 'plant';
  const results = useMemo(
    () => filterProducts(products, { category, text, flags: plantOnly ? flags : [] }),
    [products, category, text, flags, plantOnly],
  );

  const toggleFlag = (f: ShopFlag) => setFlags((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <Screen>
      <AppText variant="title" style={{ marginTop: space.lg }}>
        {t((d) => d.shop.title)}
      </AppText>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <Search size={18} color={colors.muted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t((d) => d.shop.searchPlaceholder)}
          placeholderTextColor={colors.muted}
          accessibilityLabel={t((d) => d.common.search)}
          style={[styles.input, { color: colors.ink, fontFamily: bodyFont() }]}
          returnKeyType="search"
        />
        {text.length > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel={t((d) => d.common.close)} onPress={() => setText('')} hitSlop={8}>
            <X size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c === 'all' ? t((d) => d.common.all) : t((d) => d.shop.categories[c])}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </ScrollView>

      {plantOnly && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.chips}>
          {FLAGS.map((f) => (
            <Chip key={f} label={t((d) => d.shop.filters[f])} selected={flags.includes(f)} onPress={() => toggleFlag(f)} />
          ))}
        </ScrollView>
      )}

      <AppText variant="small" color={colors.muted} style={{ marginVertical: space.md }}>
        {t((d) => d.common.items, { count: results.length })}
      </AppText>

      {results.length === 0 ? (
        <AppText color={colors.muted} center style={{ marginTop: space.xxl }}>
          {t((d) => d.shop.empty)}
        </AppText>
      ) : (
        <View style={styles.grid} key={locale}>
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    minHeight: 48,
    marginTop: space.lg,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  bleed: { marginHorizontal: -space.lg, marginTop: space.md, flexGrow: 0 },
  chips: { gap: space.sm, paddingHorizontal: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
