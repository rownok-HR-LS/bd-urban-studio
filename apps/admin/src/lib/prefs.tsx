import { createTranslator, palette, type Locale, type Translate } from '@bdu/core';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Appearance = 'system' | 'light' | 'dark';

interface Prefs {
  locale: Locale;
  setLocale: (l: Locale) => void;
  appearance: Appearance;
  setAppearance: (a: Appearance) => void;
  t: Translate;
}

const Ctx = createContext<Prefs | null>(null);
const KEY = 'bdu.admin.prefs.v1';

function load(): { locale: Locale; appearance: Appearance } {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return {
      locale: saved.locale === 'bn' ? 'bn' : 'en',
      appearance: ['light', 'dark'].includes(saved.appearance) ? saved.appearance : 'system',
    };
  } catch {
    return { locale: 'en', appearance: 'system' };
  }
}

const darkQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

function useSystemDark(): boolean {
  const query = darkQuery;
  const [dark, setDark] = useState(query?.matches ?? false);
  useEffect(() => {
    if (!query) return;
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [query]);
  return dark;
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => load().locale);
  const [appearance, setAppearance] = useState<Appearance>(() => load().appearance);
  const systemDark = useSystemDark();
  const scheme = appearance === 'system' ? (systemDark ? 'dark' : 'light') : appearance;

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(palette[scheme])) root.style.setProperty(`--c-${key}`, value);
    root.dataset.theme = scheme;
    root.lang = locale;
    try {
      localStorage.setItem(KEY, JSON.stringify({ locale, appearance }));
    } catch {
      // Private mode or blocked storage: preferences just won't persist.
    }
  }, [scheme, locale, appearance]);

  const value = useMemo(
    () => ({ locale, setLocale, appearance, setAppearance, t: createTranslator(locale) }),
    [locale, appearance],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): Prefs {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider');
  return ctx;
}
