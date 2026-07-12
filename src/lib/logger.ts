import { config } from './config';

/**
 * Ein winziger Logger als zentrale Stelle.
 * In Produktion später leicht durch Sentry/Crashlytics ersetzbar,
 * ohne im ganzen Code console.log suchen zu müssen.
 */
export const logger = {
  debug(...args: unknown[]) {
    if (!config.isProduction) console.log('[debug]', ...args);
  },
  info(...args: unknown[]) {
    console.log('[info]', ...args);
  },
  warn(...args: unknown[]) {
    console.warn('[warn]', ...args);
  },
  error(...args: unknown[]) {
    console.error('[error]', ...args);
    // TODO: In Produktion an einen Crash-Reporter (z. B. Sentry) senden.
  },
};
