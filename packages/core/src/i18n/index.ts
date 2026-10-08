import type { Locale } from '../types';
import { toBanglaDigits } from '../format';
import { bn } from './bn';
import { en, type Dictionary } from './en';

export type { Dictionary };
export const dictionaries: Record<Locale, Dictionary> = { en, bn };

type Vars = Record<string, string | number>;

/** Fills {placeholders}; numbers become Bangla digits in the bn locale. */
export function interpolate(template: string, vars: Vars | undefined, locale: Locale): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    if (value === undefined) return `{${key}}`;
    const text = String(value);
    return locale === 'bn' && typeof value === 'number' ? toBanglaDigits(text) : text;
  });
}

/** Builds a translator: t(d => d.home.heroTitle) or t(d => d.common.items, { count: 3 }). */
export function createTranslator(locale: Locale) {
  const dict = dictionaries[locale];
  return (select: (d: Dictionary) => string, vars?: Vars) => interpolate(select(dict), vars, locale);
}

export type Translate = ReturnType<typeof createTranslator>;

/** Translates a catalog unit ("pot", "sq ft"…), falling back to the raw unit. */
export function unitLabel(unit: string, locale: Locale): string {
  const units = dictionaries[locale].units as Record<string, string>;
  return units[unit] ?? unit;
}
