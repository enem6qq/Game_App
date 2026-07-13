/**
 * Spielinhalte & Balancing – die EINE Stelle für alle Zahlenwerte.
 * Namen/Beschreibungen liegen als i18n-Schlüssel in den Sprachdateien
 * (game.buildings.<id>.name usw.), hier steht nur die Spiellogik.
 */
import type {
  BlessingId,
  BuildingId,
  ExpeditionTierId,
  ResourceId,
  Resources,
} from './types';

// ---------------------------------------------------------------------------
// Konstanten
// ---------------------------------------------------------------------------

/** Offline-Fortschritt wird höchstens für diese Dauer angerechnet. */
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;

/** Der Windstrom wechselt alle 2 Stunden. */
export const WIND_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Die Wetterfront wechselt alle 3 Stunden. */
export const WEATHER_WINDOW_MS = 3 * 60 * 60 * 1000;

/** Nacht: ab 20 Uhr bis vor 6 Uhr (Ortszeit). */
export const NIGHT_START_HOUR = 20;
export const NIGHT_END_HOUR = 6;

/** Produktions-Zeitscheiben: 15 min decken alle Fenstergrenzen ab. */
export const SLICE_MS = 15 * 60 * 1000;

export const MAX_BUILDING_LEVEL = 10;

/** Kosten und Limit für Gleiter. */
export const GLEITER_COST: Resources = { korn: 30, holz: 20, stein: 0, aether: 0 };
export const GLEITER_PER_WERFT_LEVEL = 5;

/** Ab dieser Wachtturm-Stufe sind zwei Expeditionen gleichzeitig möglich. */
export const SECOND_EXPEDITION_TOWER_LEVEL = 5;

/** Lagerlimit je Ressource bei Speicher-Stufe L: 400 × 1,6^L. */
export const STORAGE_BASE = 400;
export const STORAGE_GROWTH = 1.6;

/** Wachstumsfaktoren für Kosten & Bauzeit pro Stufe. */
export const COST_GROWTH = 1.55;
export const TIME_GROWTH = 1.9;

/** Produktion pro Stunde auf Stufe L: basis × L × 1,15^(L−1). */
export const PRODUCTION_LEVEL_GROWTH = 1.15;

/** Chronik-Länge begrenzen, damit der Spielstand klein bleibt. */
export const CHRONICLE_MAX_ENTRIES = 100;

export const MAX_ISLAND_NAME_LENGTH = 24;

/** Anzeige-Symbole der Ressourcen (Platzhalter bis eigene Grafiken da sind). */
export const RESOURCE_EMOJI: Record<ResourceId, string> = {
  korn: '🌾',
  holz: '🪵',
  stein: '🪨',
  aether: '✨',
};

// ---------------------------------------------------------------------------
// Gebäude
// ---------------------------------------------------------------------------

export type BuildingDef = {
  id: BuildingId;
  emoji: string;
  /** Benötigte Himmelsdock-Stufe, damit das Gebäude gebaut werden darf. */
  unlockDock: number;
  /** Grundkosten für Stufe 1 (skaliert mit COST_GROWTH). */
  baseCost: Partial<Record<ResourceId, number>>;
  /** Bauzeit für Stufe 1 in Millisekunden (skaliert mit TIME_GROWTH). */
  baseTimeMs: number;
  /** Produziert diese Ressource (falls Produktionsgebäude). */
  produces?: { resource: ResourceId; basePerHour: number };
};

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  himmelsdock: {
    id: 'himmelsdock',
    emoji: '🏰',
    unlockDock: 0,
    baseCost: { holz: 90, stein: 60 },
    baseTimeMs: 90_000,
  },
  windmuehle: {
    id: 'windmuehle',
    emoji: '🌾',
    unlockDock: 1,
    baseCost: { holz: 50, stein: 20 },
    baseTimeMs: 45_000,
    produces: { resource: 'korn', basePerHour: 120 },
  },
  hain: {
    id: 'hain',
    emoji: '🌳',
    unlockDock: 1,
    baseCost: { korn: 40, stein: 20 },
    baseTimeMs: 45_000,
    produces: { resource: 'holz', basePerHour: 90 },
  },
  nebelbruch: {
    id: 'nebelbruch',
    emoji: '⛏️',
    unlockDock: 1,
    baseCost: { korn: 40, holz: 50 },
    baseTimeMs: 60_000,
    produces: { resource: 'stein', basePerHour: 60 },
  },
  speicher: {
    id: 'speicher',
    emoji: '🏺',
    unlockDock: 1,
    baseCost: { holz: 60, stein: 60 },
    baseTimeMs: 75_000,
  },
  wachtturm: {
    id: 'wachtturm',
    emoji: '🗼',
    unlockDock: 2,
    baseCost: { holz: 100, stein: 80 },
    baseTimeMs: 90_000,
  },
  werft: {
    id: 'werft',
    emoji: '🪂',
    unlockDock: 2,
    baseCost: { korn: 80, holz: 120 },
    baseTimeMs: 100_000,
  },
  kollektor: {
    id: 'kollektor',
    emoji: '🔮',
    unlockDock: 3,
    baseCost: { holz: 120, stein: 150 },
    baseTimeMs: 120_000,
    produces: { resource: 'aether', basePerHour: 4 },
  },
};

export const BUILDING_IDS = Object.keys(BUILDINGS) as BuildingId[];

// ---------------------------------------------------------------------------
// Wetter & Wind
// ---------------------------------------------------------------------------

export type WeatherDef = {
  emoji: string;
  weight: number;
  /** Produktions-Multiplikatoren je Ressource (fehlend = 1). */
  multipliers: Partial<Record<ResourceId, number>>;
};

export const WEATHERS = {
  klar: { emoji: '☀️', weight: 40, multipliers: {} },
  nebelbank: { emoji: '🌫️', weight: 25, multipliers: { stein: 1.3, korn: 0.9 } },
  sturmfront: { emoji: '🌪️', weight: 20, multipliers: { holz: 1.4, korn: 0.85 } },
  aetherregen: { emoji: '💜', weight: 15, multipliers: { aether: 2 } },
} satisfies Record<string, WeatherDef>;

/** Der Windstrom begünstigt genau eine Ressource. */
export const WIND_BONUS = 1.35;
export const WIND_RESOURCES: ResourceId[] = ['korn', 'holz', 'stein', 'aether'];

/** Nachts sammelt der Aetherkollektor +50 %. */
export const NIGHT_AETHER_BONUS = 1.5;

// ---------------------------------------------------------------------------
// Expeditionen
// ---------------------------------------------------------------------------

export type ExpeditionTierDef = {
  id: ExpeditionTierId;
  emoji: string;
  durationMs: number;
  gleiter: number;
  minTower: number;
  /** Grund-Beute (wird durch Ereignis-Ausgang & Boni multipliziert). */
  baseLoot: Partial<Record<ResourceId, number>>;
  baseAether: number;
};

export const EXPEDITION_TIERS: Record<ExpeditionTierId, ExpeditionTierDef> = {
  naheInseln: {
    id: 'naheInseln',
    emoji: '🏝️',
    durationMs: 15 * 60 * 1000,
    gleiter: 3,
    minTower: 1,
    baseLoot: { korn: 90, holz: 70, stein: 45 },
    baseAether: 2,
  },
  nebelmeer: {
    id: 'nebelmeer',
    emoji: '🌫️',
    durationMs: 60 * 60 * 1000,
    gleiter: 8,
    minTower: 3,
    baseLoot: { korn: 320, holz: 260, stein: 170 },
    baseAether: 6,
  },
  sturmguertel: {
    id: 'sturmguertel',
    emoji: '🌪️',
    durationMs: 4 * 60 * 60 * 1000,
    gleiter: 15,
    minTower: 5,
    baseLoot: { korn: 1100, holz: 900, stein: 650 },
    baseAether: 18,
  },
  vergesseneHoehen: {
    id: 'vergesseneHoehen',
    emoji: '🏛️',
    durationMs: 8 * 60 * 60 * 1000,
    gleiter: 25,
    minTower: 7,
    baseLoot: { korn: 2600, holz: 2200, stein: 1600 },
    baseAether: 45,
  },
};

export const EXPEDITION_TIER_IDS = Object.keys(EXPEDITION_TIERS) as ExpeditionTierId[];

/** Beute-Bonus je Wachtturm-Stufe über Stufe 1 hinaus. */
export const TOWER_LOOT_BONUS_PER_LEVEL = 0.08;

// ---------------------------------------------------------------------------
// Segen (dauerhafte Boni gegen Aether)
// ---------------------------------------------------------------------------

export type BlessingDef = {
  id: BlessingId;
  emoji: string;
  maxLevel: number;
  /** Aether-Kosten je Stufe (Index 0 = Stufe 1). */
  costs: number[];
};

export const BLESSINGS: Record<BlessingId, BlessingDef> = {
  rueckenwind: { id: 'rueckenwind', emoji: '🌬️', maxLevel: 3, costs: [20, 50, 120] },
  fleissigeHaende: {
    id: 'fleissigeHaende',
    emoji: '🔨',
    maxLevel: 3,
    costs: [15, 40, 100],
  },
  weitblick: { id: 'weitblick', emoji: '🔭', maxLevel: 3, costs: [25, 60, 140] },
  zweiterBautrupp: { id: 'zweiterBautrupp', emoji: '👷', maxLevel: 1, costs: [80] },
};

export const BLESSING_IDS = Object.keys(BLESSINGS) as BlessingId[];

/** Wirkung pro Segen-Stufe. */
export const BLESSING_PRODUCTION_BONUS = 0.1; // Rückenwind
export const BLESSING_BUILD_TIME_FACTOR = 0.9; // Fleißige Hände (pro Stufe)
export const BLESSING_LOOT_BONUS = 0.15; // Weitblick

// ---------------------------------------------------------------------------
// Aufgaben (geführte Quest-Kette)
// ---------------------------------------------------------------------------

export type QuestCondition =
  | { type: 'building'; building: BuildingId; level: number }
  | { type: 'lifetime'; resource: ResourceId; amount: number }
  | { type: 'gleiter'; count: number }
  | { type: 'expeditions'; count: number }
  | { type: 'blessings'; count: number };

export type QuestDef = {
  id: string;
  condition: QuestCondition;
  reward: Partial<Record<ResourceId, number>>;
};

export const QUESTS: QuestDef[] = [
  // Zuerst das Dock: Kein Gebäude darf höher sein als das Himmelsdock –
  // diese Aufgabe bringt die Regel gleich zu Spielbeginn bei.
  {
    id: 'dock2',
    condition: { type: 'building', building: 'himmelsdock', level: 2 },
    reward: { aether: 5 },
  },
  {
    id: 'windmuehle2',
    condition: { type: 'building', building: 'windmuehle', level: 2 },
    reward: { holz: 80 },
  },
  {
    id: 'hain2',
    condition: { type: 'building', building: 'hain', level: 2 },
    reward: { korn: 80 },
  },
  {
    id: 'nebelbruch1',
    condition: { type: 'building', building: 'nebelbruch', level: 1 },
    reward: { stein: 60 },
  },
  {
    id: 'wachtturm1',
    condition: { type: 'building', building: 'wachtturm', level: 1 },
    reward: { korn: 100, holz: 100 },
  },
  {
    id: 'werft1',
    condition: { type: 'building', building: 'werft', level: 1 },
    reward: { stein: 80 },
  },
  {
    id: 'gleiter3',
    condition: { type: 'gleiter', count: 3 },
    reward: { korn: 60 },
  },
  {
    id: 'expedition1',
    condition: { type: 'expeditions', count: 1 },
    reward: { aether: 10 },
  },
  {
    id: 'dock3',
    condition: { type: 'building', building: 'himmelsdock', level: 3 },
    reward: { aether: 10 },
  },
  {
    id: 'kollektor1',
    condition: { type: 'building', building: 'kollektor', level: 1 },
    reward: { holz: 120, stein: 120 },
  },
  {
    id: 'korn2000',
    condition: { type: 'lifetime', resource: 'korn', amount: 2000 },
    reward: { aether: 15 },
  },
  {
    id: 'segen1',
    condition: { type: 'blessings', count: 1 },
    reward: { korn: 200, holz: 200, stein: 200 },
  },
  {
    id: 'dock4',
    condition: { type: 'building', building: 'himmelsdock', level: 4 },
    reward: { aether: 25 },
  },
];
