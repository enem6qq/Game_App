import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Dynamische App-Konfiguration.
 * Werte kommen aus Umgebungsvariablen (.env), damit dieselbe Codebasis
 * für unterschiedliche Umgebungen (dev / staging / prod) genutzt werden kann.
 *
 * Umbenennen für eine neue App: name, slug, scheme, bundleIdentifier, package.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_NAME ?? 'Wolkenfeste',
  slug: 'wolkenfeste',
  scheme: 'wolkenfeste',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.example.wolkenfeste',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.example.wolkenfeste',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Öffentliche Konfiguration – zur Laufzeit über expo-constants abrufbar.
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    environment: process.env.APP_ENV ?? 'development',
    router: {
      origin: false,
    },
  },
});
