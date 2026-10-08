import type { Bilingual, Locale } from './types';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Converts ASCII digits to Bangla digits. */
export function toBanglaDigits(text: string): string {
  return text.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** Formats a number with South Asian grouping (1,00,000) in the given locale. */
export function formatNumber(value: number, locale: Locale): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded));
  // Indian/Bangladeshi grouping: last 3 digits, then groups of 2.
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
  const out = sign + grouped;
  return locale === 'bn' ? toBanglaDigits(out) : out;
}

/** Formats a BDT amount, e.g. "৳1,250" or "৳১,২৫০". */
export function formatPrice(value: number, locale: Locale): string {
  return '৳' + formatNumber(value, locale);
}

/** Picks the text for the active locale, falling back to English. */
export function pick(text: Bilingual, locale: Locale): string {
  return (locale === 'bn' ? text.bn : text.en) || text.en;
}

/** Shows a number as-is (no rounding) with Bangla digits in the bn locale. */
export function localDigits(value: number | string, locale: Locale): string {
  const text = String(value);
  return locale === 'bn' ? toBanglaDigits(text) : text;
}
