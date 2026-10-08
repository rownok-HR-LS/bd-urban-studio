// Design tokens for the "calm lofi botanical" look. Both apps read from here so
// the customer app, crew app and admin dashboard feel like one product.

export const palette = {
  light: {
    bg: '#F6F1E7',
    surface: '#FFFDF8',
    surfaceAlt: '#EFE8DA',
    ink: '#22302A',
    inkSoft: '#4A5A51',
    muted: '#7A887F',
    line: '#E2D9C6',
    primary: '#3F6B4E',
    primaryInk: '#FFFDF8',
    primarySoft: '#DCE8D5',
    accent: '#C9734B',
    accentSoft: '#F5E2D5',
    sun: '#E2A93B',
    sunSoft: '#FBEFD3',
    sky: '#5F8FA0',
    skySoft: '#DDEBEF',
    success: '#4F8A5B',
    warning: '#C58A1E',
    danger: '#B4483C',
    dangerSoft: '#F6DEDA',
  },
  dark: {
    bg: '#121814',
    surface: '#1A221D',
    surfaceAlt: '#222C26',
    ink: '#ECE6D8',
    inkSoft: '#C9C3B4',
    muted: '#93A096',
    line: '#2D3832',
    primary: '#8DB89A',
    primaryInk: '#121814',
    primarySoft: '#26382C',
    accent: '#E39A74',
    accentSoft: '#3A2A22',
    sun: '#EBC066',
    sunSoft: '#3A3121',
    sky: '#8AB6C4',
    skySoft: '#1F3036',
    success: '#7DB889',
    warning: '#E0B054',
    danger: '#E07C70',
    dangerSoft: '#3B2422',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type ThemeColors = { [K in keyof (typeof palette)['light']]: string };

export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

/** Font family names as loaded by each app (Google Fonts). */
export const fonts = {
  display: 'Fraunces',
  body: 'DM Sans',
  bangla: 'Hind Siliguri',
} as const;

export const typeScale = {
  hero: { size: 34, line: 40 },
  title: { size: 26, line: 32 },
  heading: { size: 20, line: 26 },
  body: { size: 16, line: 23 },
  small: { size: 14, line: 20 },
  tiny: { size: 12, line: 16 },
} as const;
