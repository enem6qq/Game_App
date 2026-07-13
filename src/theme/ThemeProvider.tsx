import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';

import { themes, type AppTheme } from './index';

/**
 * Stellt das aktive Theme (hell/dunkel) über die ganze App bereit.
 * Der Nutzer kann in den Einstellungen zwischen "System", "Hell" und
 * "Dunkel" wählen (siehe settingsStore).
 */
const ThemeContext = createContext<AppTheme>(themes.light);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((s) => s.themePreference);

  const theme = useMemo(() => {
    const active = preference === 'system' ? (systemScheme ?? 'light') : preference;
    return active === 'dark' ? themes.dark : themes.light;
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Hook für den Zugriff auf Farben, Abstände usw. in jeder Komponente. */
export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
