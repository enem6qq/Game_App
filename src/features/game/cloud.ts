/**
 * Cloud-Spielstand über Supabase (optional).
 * Funktioniert nur mit konfiguriertem Supabase UND angemeldetem Konto –
 * im Gast-Modus bleibt alles lokal. Der Abgleich ist bewusst MANUELL
 * (Sichern/Laden im Profil), damit nie ungewollt etwas überschrieben wird.
 */
import { config } from '@/lib/config';
import { supabase } from '@/lib/supabase';

import { GAME_STATE_VERSION, migrateGameState, type GameState } from './engine';

export type CloudSaveInfo = { updatedAt: string };

type Ok<T> = { ok: true } & T;
type Err = { ok: false; message: string };

export const cloudAvailable = (): boolean => config.hasSupabase;

/** Spielstand in die Cloud schreiben (überschreibt den vorhandenen). */
export async function uploadSave(
  userId: string,
  state: GameState,
): Promise<Ok<object> | Err> {
  if (!cloudAvailable()) return { ok: false, message: 'cloud_disabled' };
  const { error } = await supabase.from('game_saves').upsert({
    user_id: userId,
    state: state as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/** Spielstand aus der Cloud holen (inkl. Migration auf aktuelle Version). */
export async function downloadSave(
  userId: string,
): Promise<Ok<{ state: GameState; info: CloudSaveInfo }> | Err> {
  if (!cloudAvailable()) return { ok: false, message: 'cloud_disabled' };
  const { data, error } = await supabase
    .from('game_saves')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: 'no_save' };

  const state = migrateGameState(data.state, Date.now());
  if (state.version !== GAME_STATE_VERSION) {
    return { ok: false, message: 'bad_save' };
  }
  return { ok: true, state, info: { updatedAt: data.updated_at } };
}
