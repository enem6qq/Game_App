/**
 * Windstrom, Wetterfronten und Tag/Nacht.
 * Alles ist eine reine Funktion der echten Uhrzeit: Das Zeitfenster
 * (Epoche ÷ Fensterlänge) wird als Seed verwendet – dadurch sehen alle
 * Spieler dasselbe Wetter, die Vorhersage ist möglich und Tests sind
 * exakt reproduzierbar. Es muss nichts gespeichert werden.
 */
import {
  NIGHT_AETHER_BONUS,
  NIGHT_END_HOUR,
  NIGHT_START_HOUR,
  WEATHERS,
  WEATHER_WINDOW_MS,
  WIND_BONUS,
  WIND_RESOURCES,
  WIND_WINDOW_MS,
} from './content';
import { combineSeed, mulberry32, weightedIndex } from './rng';
import type { ResourceId, WeatherId } from './types';

/** Salz-Werte, damit Wind und Wetter unabhängige Zufallsreihen haben. */
const WIND_SALT = 0x57494e44; // "WIND"
const WEATHER_SALT = 0x57455448; // "WETH"

const WEATHER_IDS = Object.keys(WEATHERS) as WeatherId[];
const WEATHER_WEIGHTS = WEATHER_IDS.map((id) => WEATHERS[id].weight);

/** Welche Ressource der Windstrom im Fenster um `ms` begünstigt. */
export function windAt(ms: number): ResourceId {
  const windowIndex = Math.floor(ms / WIND_WINDOW_MS);
  const rand = mulberry32(combineSeed(WIND_SALT, windowIndex));
  const index = Math.floor(rand() * WIND_RESOURCES.length);
  return WIND_RESOURCES[index] ?? 'korn';
}

/** Die Wetterfront im Fenster um `ms`. */
export function weatherAt(ms: number): WeatherId {
  const windowIndex = Math.floor(ms / WEATHER_WINDOW_MS);
  const rand = mulberry32(combineSeed(WEATHER_SALT, windowIndex));
  return WEATHER_IDS[weightedIndex(rand, WEATHER_WEIGHTS)] ?? 'klar';
}

/** Nacht gilt ab NIGHT_START_HOUR bis vor NIGHT_END_HOUR (Ortszeit). */
export function isNight(ms: number): boolean {
  const hour = new Date(ms).getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

export type WindForecastEntry = {
  from: number;
  to: number;
  resource: ResourceId;
};

/** Vorhersage: das aktuelle und die nächsten Windfenster. */
export function windForecast(ms: number, count: number): WindForecastEntry[] {
  const entries: WindForecastEntry[] = [];
  let windowStart = Math.floor(ms / WIND_WINDOW_MS) * WIND_WINDOW_MS;
  for (let i = 0; i < count; i++) {
    entries.push({
      from: windowStart,
      to: windowStart + WIND_WINDOW_MS,
      resource: windAt(windowStart),
    });
    windowStart += WIND_WINDOW_MS;
  }
  return entries;
}

/**
 * Kombinierte Produktions-Multiplikatoren (Wind × Wetter × Nacht)
 * zum Zeitpunkt `ms`. Innerhalb einer 15-Minuten-Scheibe konstant.
 */
export function environmentMultipliers(ms: number): Record<ResourceId, number> {
  const result: Record<ResourceId, number> = {
    korn: 1,
    holz: 1,
    stein: 1,
    aether: 1,
  };

  result[windAt(ms)] *= WIND_BONUS;

  const weather = WEATHERS[weatherAt(ms)];
  for (const [resource, mult] of Object.entries(weather.multipliers)) {
    result[resource as ResourceId] *= mult;
  }

  if (isNight(ms)) {
    result.aether *= NIGHT_AETHER_BONUS;
  }

  return result;
}
