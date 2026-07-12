import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Mehrsprachigkeit (i18n).
 * Standardsprache ist Deutsch. Die Systemsprache wird beim ersten Start
 * erkannt; danach gilt die in den Einstellungen gewählte Sprache.
 */
const savedLanguage = useSettingsStore.getState().language;
const deviceLanguage = getLocales()[0]?.languageCode ?? 'de';
const initialLanguage = savedLanguage ?? (deviceLanguage === 'en' ? 'en' : 'de');

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
});

export default i18n;
