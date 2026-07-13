import Constants from 'expo-constants';

/**
 * Zentraler Zugriff auf die App-Konfiguration.
 * Alle Werte kommen aus app.config.ts -> extra (gespeist aus .env).
 * So gibt es genau EINE Stelle, an der Konfiguration gelesen wird.
 *
 * Wichtig: Das Spiel läuft komplett OHNE Backend (Gast-Modus).
 * Fehlende Supabase-Werte sind deshalb kein Fehler – `hasSupabase`
 * zeigt an, ob Online-Funktionen (Konto, Cloud-Spielstand) verfügbar sind.
 */
type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  stripePublishableKey?: string;
  environment?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Platzhalter, damit der Supabase-Client auch ohne Konfiguration
 * erzeugt werden kann (er wird dann schlicht nie erfolgreich anfragen).
 */
const SUPABASE_URL_PLACEHOLDER = 'https://placeholder.supabase.co';
const SUPABASE_KEY_PLACEHOLDER = 'placeholder-anon-key';

export const config = {
  environment: extra.environment ?? 'development',
  isProduction: extra.environment === 'production',
  /** true, sobald echte Supabase-Zugangsdaten hinterlegt sind (.env). */
  hasSupabase: Boolean(extra.supabaseUrl && extra.supabaseAnonKey),
  supabase: {
    url: extra.supabaseUrl ?? SUPABASE_URL_PLACEHOLDER,
    anonKey: extra.supabaseAnonKey ?? SUPABASE_KEY_PLACEHOLDER,
  },
  stripe: {
    publishableKey: extra.stripePublishableKey ?? '',
  },
} as const;
