/**
 * Erkundungsmodus: Aetherfunken in der begehbaren Welt.
 * Alle 2 Stunden verteilt die Welt neue Funken – deterministisch aus dem
 * Zeitfenster berechnet (wie Wind und Wetter). Eingesammelte Funken
 * merkt sich der Spielstand, bis das nächste Fenster beginnt.
 */
import { EXPLORE_WINDOW_MS, EXPLORE_WORLD_WIDTH, SPARKS_PER_WINDOW } from './content';
import { combineSeed, mulberry32 } from './rng';
import type { GameState } from './types';

const SPARK_SALT = 0x46554e4b; // "FUNK"

export type Spark = {
  index: number;
  /** Position in Welt-Koordinaten (0 … EXPLORE_WORLD_WIDTH). */
  x: number;
  /** Aether-Wert (1–3). */
  amount: number;
};

export function exploreWindowAt(ms: number): number {
  return Math.floor(ms / EXPLORE_WINDOW_MS);
}

/** Die Funken des Zeitfensters – für alle Spieler gleich. */
export function sparksForWindow(windowIndex: number): Spark[] {
  const rand = mulberry32(combineSeed(SPARK_SALT, windowIndex));
  return Array.from({ length: SPARKS_PER_WINDOW }, (_, index) => ({
    index,
    x: Math.round(120 + rand() * (EXPLORE_WORLD_WIDTH - 240)),
    amount: 1 + Math.floor(rand() * 3),
  }));
}

/** Noch nicht eingesammelte Funken zum Zeitpunkt `ms`. */
export function remainingSparks(state: GameState, ms: number): Spark[] {
  const window = exploreWindowAt(ms);
  const collected =
    state.exploration.window === window ? state.exploration.collected : [];
  return sparksForWindow(window).filter((s) => !collected.includes(s.index));
}
