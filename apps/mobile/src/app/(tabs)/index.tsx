import { defaultSettings, radius, space } from '@bdu/core';
import { router } from 'expo-router';
import { Camera, HeartHandshake, ShieldCheck, Sparkles, Truck } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BundleCard } from '@/components/bundle-card';
import { Illustration } from '@/components/illustration';
import { LanguageToggle } from '@/components/language-toggle';
import { ProductCard } from '@/components/product-card';
import { AppText, Button, Card, Notice, Screen, SectionHeader } from '@/components/ui';
import { useCatalog } from '@/lib/catalog';
import { usePrefs } from '@/lib/preferences';

// Hand-picked best-sellers for the home screen (popular, easy, good in Dhaka).
const POPULAR_SKUS = ['PLT-0001', 'PLT-0002', 'PLT-0004', 'PLT-0030', 'PLT-0029', 'PLT-0048'];

export default function HomeScreen() {
  const { colors, t } = usePrefs();
  const { products, bundles, demo } = useCatalog();
  const popular = POPULAR_SKUS.map((sku) => products.find((p) => p.sku === sku)).filter((p) => p !== undefined);
  const heroPlants = products.filter((p) => ['PLT-0004', 'PLT-0030', 'PLT-0001'].includes(p.sku));

  const steps = [
    { icon: Camera, title: t((d) => d.home.step1Title), body: t((d) => d.home.step1Body) },
    { icon: Sparkles, title: t((d) => d.home.step2Title), body: t((d) => d.home.step2Body) },
    { icon: Truck, title: t((d) => d.home.step3Title), body: t((d) => d.home.step3Body) },
    { icon: HeartHandshake, title: t((d) => d.home.step4Title), body: t((d) => d.home.step4Body) },
  ];

  return (
    <Screen>
      <View style={styles.topBar}>
        <AppText variant="heading" color={colors.primary}>
          {t((d) => d.brand.name)}
        </AppText>
        <LanguageToggle />
      </View>

      {demo && <Notice text={t((d) => d.common.demoMode)} />}

      <Card tone="primary" style={styles.hero}>
        <View style={styles.heroArt}>
          {heroPlants.map((p, i) => (
            <Illustration key={p.id} spec={p.illustration} size={i === 1 ? 120 : 92} />
          ))}
        </View>
        <AppText variant="hero">{t((d) => d.home.heroTitle)}</AppText>
        <AppText color={colors.inkSoft}>{t((d) => d.home.heroBody)}</AppText>
        <Button
          label={t((d) => d.home.startDesign)}
          icon={<Camera size={20} color={colors.primaryInk} />}
          onPress={() => router.push('/design')}
          style={{ marginTop: space.sm }}
        />
        <View style={styles.guarantee}>
          <ShieldCheck size={16} color={colors.primary} />
          <AppText variant="small" weight="medium" color={colors.primary}>
            {t((d) => d.home.guarantee, { days: defaultSettings.guarantee_days })}
          </AppText>
        </View>
      </Card>

      <SectionHeader title={t((d) => d.home.howItWorks)} />
      <View style={styles.steps}>
        {steps.map(({ icon: Icon, title, body }, i) => (
          <View key={i} style={[styles.step, { backgroundColor: colors.surface, borderColor: colors.line }]}>
            <View style={[styles.stepIcon, { backgroundColor: colors.accentSoft }]}>
              <Icon size={20} color={colors.accent} />
            </View>
            <AppText weight="bold">{title}</AppText>
            <AppText variant="small" color={colors.muted}>
              {body}
            </AppText>
          </View>
        ))}
      </View>

      <SectionHeader title={t((d) => d.home.bundlesTitle)} action={t((d) => d.common.seeAll)} onAction={() => router.push('/shop')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.railBleed}>
        {bundles.map((b) => (
          <BundleCard key={b.id} bundle={b} />
        ))}
      </ScrollView>

      <SectionHeader title={t((d) => d.home.popularTitle)} action={t((d) => d.common.seeAll)} onAction={() => router.push('/shop')} />
      <View style={styles.grid}>
        {popular.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.md, gap: space.md },
  hero: { marginTop: space.md, gap: space.md, borderRadius: radius.xl, padding: space.xl },
  heroArt: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: -space.sm },
  guarantee: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  step: { flexBasis: '46%', flexGrow: 1, borderRadius: radius.lg, borderWidth: 1, padding: space.lg, gap: 6 },
  stepIcon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  rail: { gap: space.md, paddingHorizontal: space.lg },
  railBleed: { marginHorizontal: -space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
