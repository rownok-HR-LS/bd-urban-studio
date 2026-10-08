import { radius, space, typeScale } from '@bdu/core';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePrefs } from '@/lib/preferences';

/** Content never stretches wider than this on tablets and desktop web. */
export const MAX_WIDTH = 720;

type TextVariant = keyof typeof typeScale;

export function AppText({
  children,
  variant = 'body',
  weight,
  color,
  style,
  numberOfLines,
  center,
}: {
  children: ReactNode;
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'bold';
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  center?: boolean;
}) {
  const { colors, bodyFont, displayFont, locale } = usePrefs();
  const display = variant === 'hero' || variant === 'title' || variant === 'heading';
  const scale = typeScale[variant];
  // Bangla script needs a little more line height to keep its vowel marks clear.
  const lineHeight = locale === 'bn' ? Math.round(scale.line * 1.12) : scale.line;
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: color ?? colors.ink,
          fontFamily: display && !weight ? displayFont() : bodyFont(weight),
          fontSize: scale.size,
          lineHeight,
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top'],
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom')[];
}) {
  const { colors } = usePrefs();
  const inner = (
    <View style={[styles.column, padded && { paddingHorizontal: space.lg }]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xxxl }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style, tone = 'surface' }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'surface' | 'primary' | 'accent' | 'sun' | 'sky' }) {
  const { colors } = usePrefs();
  const bg = { surface: colors.surface, primary: colors.primarySoft, accent: colors.accentSoft, sun: colors.sunSoft, sky: colors.skySoft }[tone];
  return (
    <View style={[{ backgroundColor: bg, borderRadius: radius.lg, borderWidth: tone === 'surface' ? 1 : 0, borderColor: colors.line, padding: space.lg }, style]}>
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress?: PressableProps['onPress'];
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { colors } = usePrefs();
  const bg = { primary: colors.primary, accent: colors.accent, secondary: colors.primarySoft, ghost: 'transparent' }[variant];
  const fg = { primary: colors.primaryInk, accent: '#FFFDF8', secondary: colors.primary, ghost: colors.primary }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        variant === 'ghost' && { paddingHorizontal: space.sm },
        style,
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <AppText weight="bold" color={fg}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}) {
  const { colors } = usePrefs();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.line,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {icon}
      <AppText variant="small" weight="medium" color={selected ? colors.primaryInk : colors.inkSoft}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function Badge({ label, tone = 'primary', icon }: { label: string; tone?: 'primary' | 'accent' | 'sun' | 'sky' | 'danger' | 'muted'; icon?: ReactNode }) {
  const { colors } = usePrefs();
  const map = {
    primary: [colors.primarySoft, colors.primary],
    accent: [colors.accentSoft, colors.accent],
    sun: [colors.sunSoft, colors.warning],
    sky: [colors.skySoft, colors.sky],
    danger: [colors.dangerSoft, colors.danger],
    muted: [colors.surfaceAlt, colors.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon}
      <AppText variant="tiny" weight="bold" color={fg}>
        {label}
      </AppText>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors } = usePrefs();
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>
      {action && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <AppText variant="small" weight="bold" color={colors.primary}>
            {action}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

export function Notice({ text, tone = 'sun' }: { text: string; tone?: 'sun' | 'sky' }) {
  const { colors } = usePrefs();
  return (
    <View style={[styles.notice, { backgroundColor: tone === 'sun' ? colors.sunSoft : colors.skySoft }]}>
      <AppText variant="small" color={colors.inkSoft}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  button: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  notice: { borderRadius: radius.md, padding: space.md },
});
