import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Language = 'de' | 'en';

type SettingsState = {
  themePreference: ThemePreference;
  language: Language;
  setThemePreference: (value: ThemePreference) => void;
  setLanguage: (value: Language) => void;
};

/**
 * Nutzer-Einstellungen (Theme, Sprache).
 * Werden dank "persist" automatisch auf dem Gerät gespeichert und
 * beim nächsten Start wiederhergestellt.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      language: 'de',
      setThemePreference: (value) => set({ themePreference: value }),
      setLanguage: (value) => set({ language: value }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
