/**
 * Stellt sicher, dass ALLE Spielinhalte (Gebäude, Events, Aufgaben,
 * Segen, Expeditionsziele, Wetter, Fehlercodes) in BEIDEN Sprachen
 * übersetzt sind. Fehlende Schlüssel fallen so im Test auf – nicht
 * erst beim Spielen.
 */
import {
  BLESSING_IDS,
  BUILDING_IDS,
  EVENTS,
  EXPEDITION_TIER_IDS,
  QUESTS,
  WEATHERS,
} from '@/features/game/engine';
import de from '@/i18n/locales/de.json';
import en from '@/i18n/locales/en.json';

const LOCALES = { de, en } as const;

function get(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (o, key) =>
        o && typeof o === 'object' ? (o as Record<string, unknown>)[key] : undefined,
      obj,
    );
}

function expectKey(path: string): void {
  for (const [name, locale] of Object.entries(LOCALES)) {
    const value = get(locale, path);
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Fehlender i18n-Schlüssel (${name}): ${path}`);
    }
  }
}

describe('i18n-Vollständigkeit der Spielinhalte', () => {
  it('alle Gebäude haben Name und Beschreibung', () => {
    for (const id of BUILDING_IDS) {
      expectKey(`game.buildings.${id}.name`);
      expectKey(`game.buildings.${id}.desc`);
    }
  });

  it('alle Expeditionsziele haben Name und Beschreibung', () => {
    for (const id of EXPEDITION_TIER_IDS) {
      expectKey(`game.expeditions.tiers.${id}.name`);
      expectKey(`game.expeditions.tiers.${id}.desc`);
    }
  });

  it('alle Ereignisse haben Titel, Text, Entscheidungen und Ausgänge', () => {
    for (const event of EVENTS) {
      expectKey(`game.events.${event.id}.title`);
      expectKey(`game.events.${event.id}.text`);
      for (const choice of event.choices) {
        expectKey(`game.events.${event.id}.choices.${choice.id}`);
        for (const outcome of choice.outcomes) {
          expectKey(`game.events.${event.id}.results.${outcome.id}`);
        }
      }
    }
  });

  it('alle Aufgaben haben einen Text', () => {
    for (const quest of QUESTS) {
      expectKey(`game.quests.${quest.id}`);
    }
  });

  it('alle Segen haben Name und Beschreibung', () => {
    for (const id of BLESSING_IDS) {
      expectKey(`game.blessings.${id}.name`);
      expectKey(`game.blessings.${id}.desc`);
    }
  });

  it('alle Wetterlagen haben einen Namen', () => {
    for (const id of Object.keys(WEATHERS)) {
      expectKey(`game.sky.weather.${id}`);
    }
  });

  it('alle Engine-Fehlercodes haben eine Meldung', () => {
    const errorCodes = [
      'notEnoughResources',
      'notEnoughAether',
      'queueFull',
      'dockLimit',
      'maxLevel',
      'locked',
      'notEnoughGleiter',
      'gleiterCap',
      'towerTooLow',
      'expeditionSlotsFull',
      'expeditionNotReady',
      'invalidChoice',
      'questNotReady',
      'blessingMax',
      'invalidName',
    ];
    for (const code of errorCodes) {
      expectKey(`game.errors.${code}`);
    }
  });

  it('beide Sprachdateien haben dieselbe Schlüsselstruktur', () => {
    const collect = (obj: unknown, prefix = ''): string[] => {
      if (typeof obj !== 'object' || obj === null) return [prefix];
      return Object.entries(obj).flatMap(([key, value]) =>
        collect(value, prefix ? `${prefix}.${key}` : key),
      );
    };
    expect(collect(de).sort()).toEqual(collect(en).sort());
  });
});
