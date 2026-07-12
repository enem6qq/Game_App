import Constants from 'expo-constants';

/**
 * Zentraler Zugriff auf die App-Konfiguration.
 * Alle Werte kommen aus app.config.ts -> extra (gespeist aus .env).
 * So gibt es genau EINE Stelle, an der Konfiguration gelesen wird.
 */
type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  stripePublishableKey?: string;
  environment?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function required(value: string | undefined, name: string): string {
  if (!value) {
    // Früher, klarer Fehler statt kryptischer Folgefehler zur Laufzeit.
    throw new Error(
      `Konfigurationswert "${name}" fehlt. Trage ihn in deiner .env-Datei ein ` +
        `(siehe .env.example).`,
    );
  }
  return value;
}

export const config = {
  environment: extra.environment ?? 'development',
  isProduction: extra.environment === 'production',
  supabase: {
    url: required(extra.supabaseUrl, 'EXPO_PUBLIC_SUPABASE_URL'),
    anonKey: required(extra.supabaseAnonKey, 'EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  },
  stripe: {
    publishableKey: extra.stripePublishableKey ?? '',
  },
} as const;
