/**
 * Produktions-Mathematik: Raten, Lagerlimits, Kosten, Bauzeiten und die
 * fensterweise Aufsummierung der Produktion über beliebige Zeiträume.
 */
import {
  BLESSING_BUILD_TIME_FACTOR,
  BLESSING_PRODUCTION_BONUS,
  BUILDINGS,
  BUILDING_IDS,
  COST_GROWTH,
  PRODUCTION_LEVEL_GROWTH,
  SLICE_MS,
  STORAGE_BASE,
  STORAGE_GROWTH,
  TIME_GROWTH,
} from './content';
import type { BuildingId, GameState, ResourceId, Resources } from './types';
import { environmentMultipliers } from './weather';

export const ZERO_RESOURCES: Resources = { korn: 0, holz: 0, stein: 0, aether: 0 };

export const RESOURCE_IDS: ResourceId[] = ['korn', 'holz', 'stein', 'aether'];

export function cloneResources(r: Resources): Resources {
  return { korn: r.korn, holz: r.holz, stein: r.stein, aether: r.aether };
}

/** Produktion eines Gebäudes pro Stunde auf Stufe `level`. */
export function buildingRatePerHour(building: BuildingId, level: number): number {
  const def = BUILDINGS[building];
  if (!def.produces || level <= 0) return 0;
  return def.produces.basePerHour * level * Math.pow(PRODUCTION_LEVEL_GROWTH, level - 1);
}

/**
 * Grundraten pro Stunde aus Gebäudestufen und Segen –
 * noch OHNE Wind/Wetter/Nacht (die kommen zeitabhängig dazu).
 */
export function baseRatesPerHour(state: GameState): Resources {
  const rates = cloneResources(ZERO_RESOURCES);
  for (const id of BUILDING_IDS) {
    const def = BUILDINGS[id];
    if (!def.produces) continue;
    rates[def.produces.resource] += buildingRatePerHour(id, state.buildings[id]);
  }
  const blessingBonus = 1 + BLESSING_PRODUCTION_BONUS * state.blessings.rueckenwind;
  for (const r of RESOURCE_IDS) rates[r] *= blessingBonus;
  return rates;
}

/** Effektive Raten pro Stunde zum Zeitpunkt `ms` (mit Umwelt-Boni). */
export function ratesPerHourAt(state: GameState, ms: number): Resources {
  const base = baseRatesPerHour(state);
  const env = environmentMultipliers(ms);
  const rates = cloneResources(ZERO_RESOURCES);
  for (const r of RESOURCE_IDS) rates[r] = base[r] * env[r];
  return rates;
}

/** Lagerlimit je Ressource (Aether ist unbegrenzt). */
export function storageCap(state: GameState): number {
  return Math.floor(STORAGE_BASE * Math.pow(STORAGE_GROWTH, state.buildings.speicher));
}

/**
 * Produktion zwischen zwei Zeitpunkten, in 15-Minuten-Scheiben
 * aufsummiert. Alle Fenstergrenzen (Wind 2 h, Wetter 3 h, Tag/Nacht zu
 * vollen Stunden) liegen auf 15-Minuten-Rastern – innerhalb einer
 * Scheibe sind die Multiplikatoren also konstant. So zählt ein
 * Wetterwechsel während der Abwesenheit exakt.
 */
export function productionBetween(
  state: GameState,
  fromMs: number,
  toMs: number,
): Resources {
  const gained = cloneResources(ZERO_RESOURCES);
  if (toMs <= fromMs) return gained;

  let cursor = fromMs;
  while (cursor < toMs) {
    const sliceEnd = Math.min(toMs, Math.floor(cursor / SLICE_MS) * SLICE_MS + SLICE_MS);
    const hours = (sliceEnd - cursor) / 3_600_000;
    const rates = ratesPerHourAt(state, cursor);
    for (const r of RESOURCE_IDS) gained[r] += rates[r] * hours;
    cursor = sliceEnd;
  }
  return gained;
}

/** Kosten für den Ausbau AUF Stufe `targetLevel`. */
export function upgradeCost(building: BuildingId, targetLevel: number): Resources {
  const def = BUILDINGS[building];
  const factor = Math.pow(COST_GROWTH, targetLevel - 1);
  const cost = cloneResources(ZERO_RESOURCES);
  for (const [resource, base] of Object.entries(def.baseCost)) {
    cost[resource as ResourceId] = Math.floor(base * factor);
  }
  return cost;
}

/** Bauzeit für den Ausbau AUF Stufe `targetLevel` (inkl. Segen-Rabatt). */
export function buildTimeMs(
  state: GameState,
  building: BuildingId,
  targetLevel: number,
): number {
  const def = BUILDINGS[building];
  const raw = def.baseTimeMs * Math.pow(TIME_GROWTH, targetLevel - 1);
  const discount = Math.pow(BLESSING_BUILD_TIME_FACTOR, state.blessings.fleissigeHaende);
  return Math.round(raw * discount);
}

/** Reichen die Vorräte für diese Kosten? */
export function canAfford(resources: Resources, cost: Resources): boolean {
  return RESOURCE_IDS.every((r) => resources[r] >= cost[r]);
}

/** Kosten abziehen (Aufrufer hat `canAfford` geprüft). */
export function subtractResources(resources: Resources, cost: Resources): Resources {
  const result = cloneResources(resources);
  for (const r of RESOURCE_IDS) result[r] -= cost[r];
  return result;
}

/**
 * Ressourcen gutschreiben: Lager-Limit beachten (Aether unbegrenzt),
 * bereits übervolle Lager werden nie nach unten korrigiert.
 */
export function addResourcesCapped(
  resources: Resources,
  gained: Resources,
  cap: number,
): Resources {
  const result = cloneResources(resources);
  for (const r of RESOURCE_IDS) {
    if (gained[r] <= 0) continue;
    if (r === 'aether') {
      result[r] += gained[r];
    } else {
      result[r] = Math.max(result[r], Math.min(cap, result[r] + gained[r]));
    }
  }
  return result;
}
