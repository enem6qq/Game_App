/**
 * Zentrales Design-System.
 * Alle Farben, Abstände, Rundungen und Schriftgrößen an EINER Stelle.
 * Komponenten greifen nur hierauf zu – nie auf feste Zahlen im Code.
 * Das hält das App-Aussehen konsistent und leicht anpassbar.
 */

const palette = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  danger: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

const lightColors = {
  primary: palette.primary,
  primaryText: palette.white,
  background: palette.white,
  surface: palette.gray50,
  border: palette.gray200,
  text: palette.gray900,
  textMuted: palette.gray500,
  danger: palette.danger,
  success: palette.success,
  warning: palette.warning,
};

const darkColors: typeof lightColors = {
  primary: palette.primary,
  primaryText: palette.white,
  background: palette.gray900,
  surface: palette.gray800,
  border: palette.gray700,
  text: palette.gray50,
  textMuted: palette.gray400,
  danger: palette.danger,
  success: palette.success,
  warning: palette.warning,
};

export const themes = {
  light: { colors: lightColors, spacing, radius, typography },
  dark: { colors: darkColors, spacing, radius, typography },
};

export type AppTheme = typeof themes.light;
export type ThemeColors = typeof lightColors;
