import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthState = {
  session: Session | null;
  user: User | null;
  /** true, solange die gespeicherte Session beim App-Start geladen wird. */
  initializing: boolean;
  setSession: (session: Session | null) => void;
  setInitializing: (value: boolean) => void;
};

/**
 * Hält die aktuelle Anmelde-Session im Speicher.
 * Gefüttert wird der Store zentral im AuthProvider über Supabase-Events.
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initializing: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitializing: (value) => set({ initializing: value }),
}));
