/**
 * Deterministischer Zufall (Seeded RNG).
 * Wind, Wetter und Expeditions-Ausgänge müssen reproduzierbar sein –
 * gleicher Seed ⇒ gleiches Ergebnis, auf jedem Gerät, in jedem Test.
 */

/** Mulberry32 – kleiner, schneller, bewährter 32-Bit-Generator. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kombiniert mehrere Zahlen zu einem gut gestreuten 32-Bit-Seed. */
export function combineSeed(...parts: number[]): number {
  let h = 0x9e3779b9;
  for (const part of parts) {
    let x = Math.trunc(part) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
    h = (Math.imul(h ^ x, 0x27d4eb2f) + 0x165667b1) | 0;
  }
  return h >>> 0;
}

/** Wählt einen Index anhand von Gewichten (Summe > 0 vorausgesetzt). */
export function weightedIndex(rand: () => number, weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i] ?? 0;
    if (roll < 0) return i;
  }
  return weights.length - 1;
}
