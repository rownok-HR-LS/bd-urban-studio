import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createTranslator,
  fonts,
  palette,
  type Locale,
  type ThemeColors,
  type Translate,
} from '@bdu/core';
import { getLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type AppearancePref = 'system' | 'light' | 'dark';

interface Preferences {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  appearance: AppearancePref;
  setAppearance: (pref: AppearancePref) => void;
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  t: Translate;
  /** Font family for body text in the current language. */
  bodyFont: (weight?: 'regular' | 'medium' | 'bold') => string;
  /** Font family for headings in the current language. */
  displayFont: () => string;
}

const PreferencesContext = createContext<Preferences | null>(null);

const STORAGE_KEY = 'bdu.preferences.v1';

function deviceLocale(): Locale {
  return getLocales()[0]?.languageCode === 'bn' ? 'bn' : 'en';
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [locale, setLocale] = useState<Locale>(deviceLocale);
  const [appearance, setAppearance] = useState<AppearancePref>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<{ locale: Locale; appearance: AppearancePref }>;
        if (saved.locale === 'en' || saved.locale === 'bn') setLocale(saved.locale);
        if (saved.appearance) setAppearance(saved.appearance);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, appearance })).catch(() => {});
  }, [hydrated, locale, appearance]);

  const value = useMemo<Preferences>(() => {
    const scheme = appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;
    const bangla = locale === 'bn';
    return {
      locale,
      setLocale,
      appearance,
      setAppearance,
      scheme,
      colors: palette[scheme],
      t: createTranslator(locale),
      bodyFont: (weight = 'regular') =>
        bangla
          ? { regular: 'HindSiliguri_400Regular', medium: 'HindSiliguri_500Medium', bold: 'HindSiliguri_600SemiBold' }[weight]
          : { regular: 'DMSans_400Regular', medium: 'DMSans_500Medium', bold: 'DMSans_700Bold' }[weight],
      displayFont: () => (bangla ? 'HindSiliguri_700Bold' : 'Fraunces_600SemiBold'),
    };
  }, [locale, appearance, system]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePrefs(): Preferences {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePrefs must be used inside PreferencesProvider');
  return ctx;
}

export { fonts };
