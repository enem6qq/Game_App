import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Bündelt alle Auth-Aktionen an einer Stelle.
 * Screens rufen einfach useAuth() auf und bekommen Zustand + Funktionen.
 *
 * Neben dem Supabase-Konto gibt es den GAST-MODUS: Das Spiel ist
 * komplett lokal spielbar; ein Konto ist optional (für spätere
 * Online-Funktionen wie Cloud-Spielstand).
 */
export function useAuth() {
  const { session, user, initializing } = useAuthStore();
  const guestMode = useSettingsStore((s) => s.guestMode);
  const setGuestMode = useSettingsStore((s) => s.setGuestMode);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    // Auch den Gast-Modus beenden, damit man wieder am Login landet.
    setGuestMode(false);
    // Ohne echte Session gibt es bei Supabase nichts abzumelden –
    // das vermeidet Netzwerkfehler im reinen Gast-Betrieb.
    if (useAuthStore.getState().session) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  }, [setGuestMode]);

  /** Ohne Konto weiterspielen – das Spiel läuft dann rein lokal. */
  const playAsGuest = useCallback(() => setGuestMode(true), [setGuestMode]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  return {
    session,
    user,
    initializing,
    isAuthenticated: !!session,
    guestMode,
    /** Darf die App betreten: angemeldet ODER Gast. */
    canEnter: !!session || guestMode,
    signIn,
    signUp,
    signOut,
    resetPassword,
    playAsGuest,
  };
}
