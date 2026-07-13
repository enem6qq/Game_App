/**
 * Der Herzschlag des Spiels: ruft einmal pro Sekunde `tick()` auf und
 * rechnet beim Zurückkehren aus dem Hintergrund die verpasste Zeit an.
 * Zusätzlich plant er beim Verlassen der App Erinnerungen für alles,
 * was gerade läuft (Bau, Expedition, Jagd) – und räumt sie beim
 * Zurückkommen wieder auf.
 * Einmal im Tab-Layout eingehängt – nicht in einzelnen Screens.
 */
import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  clearGameNotifications,
  ensureNotificationPermission,
  scheduleGameNotifications,
} from './notifications';
import { useGameStore } from './store';

export function useGameTick(): void {
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    tick();
    // Berechtigung früh und im Vordergrund anfragen (einmal pro Lauf).
    void ensureNotificationPermission();
    const interval = setInterval(() => tick(), 1000);

    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        tick();
        void clearGameNotifications();
      } else if (status === 'background') {
        void scheduleGameNotifications(useGameStore.getState().state);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [tick]);
}
