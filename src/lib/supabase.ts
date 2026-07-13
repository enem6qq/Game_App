import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/types/database';

import { config } from './config';

/**
 * Der Supabase-Client ist das Tor zum Backend:
 * - Auth (Anmeldung, Registrierung, Sessions)
 * - Datenbank (Postgres mit Row-Level-Security)
 * - Storage (Datei-Uploads)
 *
 * Die Session wird in AsyncStorage zwischengespeichert, damit der
 * Nutzer nach dem Neustart der App angemeldet bleibt.
 */
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
