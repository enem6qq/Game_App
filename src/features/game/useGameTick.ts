/**
 * Der Herzschlag des Spiels: ruft einmal pro Sekunde `tick()` auf und
 * rechnet beim Zurückkehren aus dem Hintergrund die verpasste Zeit an.
 * Einmal im Tab-Layout eingehängt – nicht in einzelnen Screens.
 */
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useGameStore } from './store';

export function useGameTick(): void {
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    tick();
    const interval = setInterval(() => tick(), 1000);

    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [tick]);
}
