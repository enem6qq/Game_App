/**
 * Wandelt beliebige geworfene Fehler in eine anzeigbare Nachricht um.
 * Supabase/Netzwerk-Fehler haben unterschiedliche Formen – hier zentral gebändigt.
 */
export function getErrorMessage(error: unknown, fallback = 'Es ist ein Fehler aufgetreten'): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return fallback;
}
