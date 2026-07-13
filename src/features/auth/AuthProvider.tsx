import React, { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

/**
 * Verbindet Supabase-Auth mit dem globalen authStore.
 * - Lädt beim Start die gespeicherte Session.
 * - Hört auf Anmelde-/Abmelde-Ereignisse und hält den Store aktuell.
 *
 * Muss möglichst weit oben in der App eingehängt sein (siehe app/_layout.tsx).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    // Bestehende Session aus dem Speicher laden.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    // Auf spätere Änderungen reagieren (Login, Logout, Token-Refresh).
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession, setInitializing]);

  return <>{children}</>;
}
