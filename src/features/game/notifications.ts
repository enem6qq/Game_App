/**
 * Lokale Benachrichtigungen: „Dein Ausbau ist fertig!" & Co.
 *
 * Strategie: Beim Wechsel in den Hintergrund wird für jeden laufenden
 * Bau, jede Expedition und jede Jagd eine Erinnerung zum Fertig-Zeitpunkt
 * geplant. Beim Zurückkehren in die App werden alle wieder entfernt –
 * so gibt es nie veraltete oder doppelte Meldungen.
 *
 * Alles ist bewusst fehler-tolerant: Benachrichtigungen sind ein
 * Nice-to-have und dürfen das Spiel niemals stören.
 */
import * as Notifications from 'expo-notifications';

import i18n from '@/i18n';

import type { GameState } from './engine';

// Anzeige-Verhalten, falls eine Meldung eintrifft, während die App offen ist.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let permissionRequested = false;

/** Fragt die Berechtigung höchstens einmal pro App-Lauf an. */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (permissionRequested || !current.canAskAgain) return false;
    permissionRequested = true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

/** Plant Erinnerungen für alles, was gerade läuft. */
export async function scheduleGameNotifications(state: GameState): Promise<void> {
  try {
    const allowed = await Notifications.getPermissionsAsync();
    if (!allowed.granted) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = Date.now();
    const t = i18n.t.bind(i18n);
    const plan = (atMs: number, title: string, body: string) => {
      // Nur echte Zukunftstermine planen (mind. 5 s entfernt).
      if (atMs <= now + 5000) return Promise.resolve('');
      return Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(atMs),
        },
      });
    };

    await Promise.all([
      ...state.queue.map((task) =>
        plan(
          task.finishesAt,
          t('game.notifications.buildTitle'),
          t('game.notifications.buildBody', {
            building: t(`game.buildings.${task.building}.name`),
            level: task.targetLevel,
          }),
        ),
      ),
      ...state.expeditions
        .filter((e) => e.status === 'unterwegs')
        .map((e) =>
          plan(
            e.finishesAt,
            t('game.notifications.expeditionTitle'),
            t('game.notifications.expeditionBody', {
              tier: t(`game.expeditions.tiers.${e.tier}.name`),
            }),
          ),
        ),
      ...state.hunts.map((h) =>
        plan(
          h.finishesAt,
          t('game.notifications.huntTitle'),
          t('game.notifications.huntBody', {
            beast: t(`game.hunts.beasts.${h.beast}.name`),
          }),
        ),
      ),
    ]);
  } catch {
    // still bleiben – siehe Modulkommentar
  }
}

/** Räumt alle geplanten/angezeigten Spiel-Meldungen weg. */
export async function clearGameNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch {
    // still bleiben
  }
}
