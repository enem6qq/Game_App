/**
 * Die Spiel-Engine: Zeitfortschritt und alle Spieler-Aktionen.
 *
 * Grundprinzip: pure Funktionen. Jede Aktion bekommt den aktuellen
 * Zustand plus Zeitpunkt und liefert einen NEUEN Zustand (oder einen
 * Fehlercode) zurück – kein verstecktes Verhalten, alles testbar.
 */
import {
  BEASTS,
  BLESSINGS,
  BLESSING_LOOT_BONUS,
  BUILDINGS,
  CHRONICLE_MAX_ENTRIES,
  COMBAT_VARIANCE,
  EXPEDITION_TIERS,
  EXPEDITION_TIER_IDS,
  GLEITER_BASE_POWER,
  GLEITER_COST,
  GLEITER_PER_WERFT_LEVEL,
  GLEITER_POWER_PER_WERFT_LEVEL,
  HUNT_CONSOLATION_LOOT,
  HUNT_LOSS_PCT,
  HUNT_WIN_MAX_LOSS,
  MAX_BUILDING_LEVEL,
  MAX_ISLAND_NAME_LENGTH,
  OFFLINE_CAP_MS,
  QUESTS,
  SECOND_EXPEDITION_TOWER_LEVEL,
  TOWER_LOOT_BONUS_PER_LEVEL,
  type BeastId,
} from './content';
import { EVENTS, getEvent } from './events';
import { exploreWindowAt, sparksForWindow } from './explore';
import {
  RESOURCE_IDS,
  ZERO_RESOURCES,
  addResourcesCapped,
  buildTimeMs,
  canAfford,
  cloneResources,
  productionBetween,
  storageCap,
  subtractResources,
  upgradeCost,
} from './production';
import { conditionMet, currentQuest, totalGleiter } from './quests';
import { combineSeed, mulberry32, weightedIndex } from './rng';
import type {
  ActionResult,
  BlessingId,
  BuildingId,
  ExpeditionResult,
  ExpeditionTierId,
  GameState,
  HuntResult,
  OfflineSummary,
  Resources,
} from './types';

export const GAME_STATE_VERSION = 3;

// ---------------------------------------------------------------------------
// Startzustand
// ---------------------------------------------------------------------------

export function createInitialState(now: number): GameState {
  return {
    version: GAME_STATE_VERSION,
    createdAt: now,
    lastTick: now,
    islandName: '',
    // Startvorräte: reichen exakt für die erste Aufgabe (Dock auf Stufe 2).
    resources: { korn: 150, holz: 150, stein: 100, aether: 0 },
    lifetime: cloneResources(ZERO_RESOURCES),
    buildings: {
      himmelsdock: 1,
      windmuehle: 1,
      hain: 1,
      nebelbruch: 0,
      speicher: 0,
      wachtturm: 0,
      werft: 0,
      kollektor: 0,
    },
    queue: [],
    gleiter: 0,
    expeditionsStarted: 0,
    expeditionsResolved: 0,
    expeditions: [],
    hunts: [],
    huntsStarted: 0,
    huntsResolved: 0,
    huntsWon: 0,
    exploration: { window: -1, collected: [] },
    questIndex: 0,
    blessings: {
      rueckenwind: 0,
      fleissigeHaende: 0,
      weitblick: 0,
      zweiterBautrupp: 0,
    },
    chronicle: [{ at: now, key: 'welcome' }],
  };
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen (auch für die UI exportiert)
// ---------------------------------------------------------------------------

function cloneState(state: GameState): GameState {
  return {
    ...state,
    resources: cloneResources(state.resources),
    lifetime: cloneResources(state.lifetime),
    buildings: { ...state.buildings },
    queue: state.queue.map((t) => ({ ...t })),
    expeditions: state.expeditions.map((e) => ({ ...e })),
    hunts: state.hunts.map((h) => ({ ...h })),
    exploration: {
      window: state.exploration.window,
      collected: [...state.exploration.collected],
    },
    blessings: { ...state.blessings },
    chronicle: [...state.chronicle],
  };
}

/**
 * Bringt einen gespeicherten (evtl. älteren) Spielstand auf die aktuelle
 * Struktur: fehlende Felder bekommen Startwerte, vorhandene bleiben.
 * Wird beim Laden aus dem Gerätespeicher aufgerufen.
 */
export function migrateGameState(old: unknown, now: number): GameState {
  const base = createInitialState(now);
  const o = (old ?? {}) as Partial<GameState>;
  return {
    ...base,
    ...o,
    version: GAME_STATE_VERSION,
    resources: { ...base.resources, ...o.resources },
    lifetime: { ...base.lifetime, ...o.lifetime },
    buildings: { ...base.buildings, ...o.buildings },
    blessings: { ...base.blessings, ...o.blessings },
    queue: o.queue ?? [],
    expeditions: o.expeditions ?? [],
    hunts: o.hunts ?? [],
    huntsStarted: o.huntsStarted ?? 0,
    huntsResolved: o.huntsResolved ?? 0,
    huntsWon: o.huntsWon ?? 0,
    exploration: o.exploration ?? { window: -1, collected: [] },
    chronicle: o.chronicle ?? base.chronicle,
  };
}

function addChronicle(
  state: GameState,
  at: number,
  key: string,
  params?: Record<string, string | number>,
): void {
  state.chronicle.unshift({ at, key, ...(params ? { params } : {}) });
  if (state.chronicle.length > CHRONICLE_MAX_ENTRIES) {
    state.chronicle.length = CHRONICLE_MAX_ENTRIES;
  }
}

/** Anzahl paralleler Bauplätze (Segen „Zweiter Bautrupp"). */
export function queueSlots(state: GameState): number {
  return 1 + (state.blessings.zweiterBautrupp > 0 ? 1 : 0);
}

/** Anzahl gleichzeitiger Expeditionen (Wachtturm-Ausbau). */
export function expeditionSlots(state: GameState): number {
  if (state.buildings.wachtturm <= 0) return 0;
  return state.buildings.wachtturm >= SECOND_EXPEDITION_TOWER_LEVEL ? 2 : 1;
}

/** Maximale Gleiterzahl (Werft-Stufe). */
export function gleiterCap(state: GameState): number {
  return state.buildings.werft * GLEITER_PER_WERFT_LEVEL;
}

/** Kampfkraft je Gleiter (steigt mit dem Ausbau der Werft). */
export function gleiterPowerPerUnit(state: GameState): number {
  return (
    GLEITER_BASE_POWER +
    GLEITER_POWER_PER_WERFT_LEVEL * Math.max(0, state.buildings.werft - 1)
  );
}

/** Gebäudestufe inklusive bereits beauftragter Ausbauten. */
export function effectiveLevel(state: GameState, building: BuildingId): number {
  let level = state.buildings[building];
  for (const task of state.queue) {
    if (task.building === building) level = Math.max(level, task.targetLevel);
  }
  return level;
}

/**
 * Ressourcen gutschreiben und den tatsächlich angekommenen Anteil
 * (nach Lagerlimit) auf `lifetime` buchen. Gibt den echten Zuwachs zurück.
 */
function credit(state: GameState, gained: Resources): Resources {
  const before = state.resources;
  const after = addResourcesCapped(before, gained, storageCap(state));
  const delta = cloneResources(ZERO_RESOURCES);
  for (const r of RESOURCE_IDS) {
    delta[r] = after[r] - before[r];
    state.lifetime[r] += delta[r];
  }
  state.resources = after;
  return delta;
}

// ---------------------------------------------------------------------------
// Zeitfortschritt
// ---------------------------------------------------------------------------

const EMPTY_SUMMARY: OfflineSummary = {
  elapsedMs: 0,
  gained: { ...ZERO_RESOURCES },
  buildsFinished: 0,
  expeditionsArrived: 0,
};

/**
 * Bringt den Spielstand von `lastTick` auf `now`:
 * 1. Fertige Bauten werden CHRONOLOGISCH abgeschlossen; die Produktion
 *    wird segmentweise angerechnet, damit ein zwischendurch fertig
 *    gewordenes Produktionsgebäude ab genau diesem Moment mitzählt.
 * 2. Angekommene Expeditionen wechseln auf „Ereignis" und warten auf
 *    die Entscheidung des Spielers.
 * 3. Offline wird höchstens OFFLINE_CAP_MS Produktion angerechnet.
 */
export function advance(
  state: GameState,
  now: number,
): { state: GameState; summary: OfflineSummary } {
  if (now <= state.lastTick) return { state, summary: EMPTY_SUMMARY };

  const s = cloneState(state);
  const summary: OfflineSummary = {
    elapsedMs: now - s.lastTick,
    gained: cloneResources(ZERO_RESOURCES),
    buildsFinished: 0,
    expeditionsArrived: 0,
  };

  const productionStart = Math.max(s.lastTick, now - OFFLINE_CAP_MS);

  const produce = (from: number, to: number) => {
    if (to <= from) return;
    const delta = credit(s, productionBetween(s, from, to));
    for (const r of RESOURCE_IDS) summary.gained[r] += delta[r];
  };

  // Fertige Bauten chronologisch anwenden, Produktion dazwischen anrechnen.
  const due = s.queue
    .filter((t) => t.finishesAt <= now)
    .sort((a, b) => a.finishesAt - b.finishesAt);
  let cursor = productionStart;
  for (const task of due) {
    const finishedAt = Math.min(Math.max(task.finishesAt, productionStart), now);
    produce(cursor, finishedAt);
    cursor = Math.max(cursor, finishedAt);
    s.buildings[task.building] = Math.max(s.buildings[task.building], task.targetLevel);
    summary.buildsFinished++;
    addChronicle(s, task.finishesAt, 'buildFinished', {
      building: task.building,
      level: task.targetLevel,
    });
  }
  produce(cursor, now);
  s.queue = s.queue.filter((t) => t.finishesAt > now);

  // Expeditionen ankommen lassen.
  for (const expedition of s.expeditions) {
    if (expedition.status === 'unterwegs' && expedition.finishesAt <= now) {
      expedition.status = 'ereignis';
      summary.expeditionsArrived++;
      addChronicle(s, expedition.finishesAt, 'expeditionArrived', {
        tier: expedition.tier,
      });
    }
  }

  s.lastTick = now;
  return { state: s, summary };
}

// ---------------------------------------------------------------------------
// Aktionen
// ---------------------------------------------------------------------------

export function startUpgrade(
  state: GameState,
  building: BuildingId,
  now: number,
): ActionResult {
  const def = BUILDINGS[building];
  const dockLevel = effectiveLevel(state, 'himmelsdock');

  if (state.buildings.himmelsdock < def.unlockDock) return { ok: false, error: 'locked' };

  const targetLevel = effectiveLevel(state, building) + 1;
  if (targetLevel > MAX_BUILDING_LEVEL) return { ok: false, error: 'maxLevel' };
  if (building !== 'himmelsdock' && targetLevel > dockLevel) {
    return { ok: false, error: 'dockLimit' };
  }
  if (state.queue.length >= queueSlots(state)) return { ok: false, error: 'queueFull' };

  const cost = upgradeCost(building, targetLevel);
  if (!canAfford(state.resources, cost)) {
    return { ok: false, error: 'notEnoughResources' };
  }

  const s = cloneState(state);
  s.resources = subtractResources(s.resources, cost);
  s.queue.push({
    building,
    targetLevel,
    startedAt: now,
    finishesAt: now + buildTimeMs(state, building, targetLevel),
  });
  return { ok: true, state: s };
}

export function trainGleiter(state: GameState, count: number, now: number): ActionResult {
  if (state.buildings.werft < 1) return { ok: false, error: 'locked' };
  if (count < 1) return { ok: false, error: 'invalidChoice' };
  if (totalGleiter(state) + count > gleiterCap(state)) {
    return { ok: false, error: 'gleiterCap' };
  }

  const cost = cloneResources(ZERO_RESOURCES);
  for (const r of RESOURCE_IDS) cost[r] = GLEITER_COST[r] * count;
  if (!canAfford(state.resources, cost)) {
    return { ok: false, error: 'notEnoughResources' };
  }

  const s = cloneState(state);
  s.resources = subtractResources(s.resources, cost);
  s.gleiter += count;
  addChronicle(s, now, 'gleiterTrained', { count });
  return { ok: true, state: s };
}

export function startExpedition(
  state: GameState,
  tierId: ExpeditionTierId,
  now: number,
): ActionResult {
  const tier = EXPEDITION_TIERS[tierId];
  if (state.buildings.wachtturm < tier.minTower) {
    return { ok: false, error: 'towerTooLow' };
  }
  if (state.expeditions.length >= expeditionSlots(state)) {
    return { ok: false, error: 'expeditionSlotsFull' };
  }
  if (state.gleiter < tier.gleiter) return { ok: false, error: 'notEnoughGleiter' };

  const seed = combineSeed(
    state.createdAt,
    state.expeditionsStarted,
    EXPEDITION_TIER_IDS.indexOf(tierId),
    now,
  );
  const rand = mulberry32(seed);
  const event = EVENTS[Math.floor(rand() * EVENTS.length)] ?? EVENTS[0];
  if (!event) return { ok: false, error: 'invalidChoice' };

  const s = cloneState(state);
  s.gleiter -= tier.gleiter;
  s.expeditionsStarted += 1;
  s.expeditions.push({
    id: `exp-${s.expeditionsStarted}`,
    tier: tierId,
    gleiter: tier.gleiter,
    startedAt: now,
    finishesAt: now + tier.durationMs,
    seed,
    eventId: event.id,
    status: 'unterwegs',
  });
  return { ok: true, state: s };
}

export function resolveExpedition(
  state: GameState,
  expeditionId: string,
  choiceId: string,
  now: number,
): ActionResult<ExpeditionResult> {
  const expedition = state.expeditions.find((e) => e.id === expeditionId);
  if (!expedition || expedition.status !== 'ereignis') {
    return { ok: false, error: 'expeditionNotReady' };
  }
  const event = getEvent(expedition.eventId);
  const choiceIndex = event?.choices.findIndex((c) => c.id === choiceId) ?? -1;
  const choice = event?.choices[choiceIndex];
  if (!event || !choice) return { ok: false, error: 'invalidChoice' };

  const rand = mulberry32(combineSeed(expedition.seed, choiceIndex));
  const outcome =
    choice.outcomes[
      weightedIndex(
        rand,
        choice.outcomes.map((o) => o.weight),
      )
    ];
  if (!outcome) return { ok: false, error: 'invalidChoice' };

  const tier = EXPEDITION_TIERS[expedition.tier];
  const bonus =
    (1 + BLESSING_LOOT_BONUS * state.blessings.weitblick) *
    (1 + TOWER_LOOT_BONUS_PER_LEVEL * Math.max(0, state.buildings.wachtturm - 1));

  const loot = cloneResources(ZERO_RESOURCES);
  for (const [resource, base] of Object.entries(tier.baseLoot)) {
    loot[resource as keyof Resources] = Math.floor(base * outcome.lootMult * bonus);
  }
  loot.aether = Math.round(tier.baseAether * outcome.aetherMult * bonus);

  const gleiterVerloren = Math.floor(expedition.gleiter * outcome.lossPct);
  const gleiterZurueck = expedition.gleiter - gleiterVerloren;

  const s = cloneState(state);
  credit(s, loot);
  s.gleiter += gleiterZurueck;
  s.expeditions = s.expeditions.filter((e) => e.id !== expeditionId);
  s.expeditionsResolved += 1;
  addChronicle(s, now, 'expeditionResolved', {
    tier: expedition.tier,
    event: event.id,
    outcome: outcome.id,
    verloren: gleiterVerloren,
  });

  return {
    ok: true,
    state: s,
    result: {
      eventId: event.id,
      choiceId,
      outcomeId: outcome.id,
      loot,
      gleiterVerloren,
      gleiterZurueck,
    },
  };
}

// ---------------------------------------------------------------------------
// Bestienjagd
// ---------------------------------------------------------------------------

export function startHunt(state: GameState, beastId: BeastId, now: number): ActionResult {
  const beast = BEASTS[beastId];
  if (state.buildings.wachtturm < beast.minTower) {
    return { ok: false, error: 'towerTooLow' };
  }
  // Eine Jagd gleichzeitig – Bestien sind kein Fließband.
  if (state.hunts.length >= 1) return { ok: false, error: 'huntActive' };
  if (state.gleiter < beast.gleiter) return { ok: false, error: 'notEnoughGleiter' };

  const s = cloneState(state);
  s.gleiter -= beast.gleiter;
  s.huntsStarted += 1;
  s.hunts.push({
    id: `jagd-${s.huntsStarted}`,
    beast: beastId,
    gleiter: beast.gleiter,
    power: beast.gleiter * gleiterPowerPerUnit(state),
    startedAt: now,
    finishesAt: now + beast.durationMs,
    seed: combineSeed(state.createdAt, s.huntsStarted, now, beast.power),
  });
  return { ok: true, state: s };
}

/**
 * Kampf auflösen: Beide Seiten würfeln ihre Kampfkraft × (0,85…1,15).
 * Sieg bringt volle Beute (inkl. Weitblick-/Wachtturm-Bonus) und wenige
 * Verluste; eine Niederlage kostet den halben Trupp und bringt nur einen
 * Trostpreis. Gleicher Seed ⇒ gleiches Ergebnis, exakt testbar.
 */
export function resolveHunt(
  state: GameState,
  huntId: string,
  now: number,
): ActionResult<HuntResult> {
  const hunt = state.hunts.find((h) => h.id === huntId);
  if (!hunt || hunt.finishesAt > now) return { ok: false, error: 'huntNotReady' };
  const beast = BEASTS[hunt.beast as BeastId];
  if (!beast) return { ok: false, error: 'invalidChoice' };

  const rand = mulberry32(hunt.seed);
  const roll = () => 1 - COMBAT_VARIANCE + rand() * 2 * COMBAT_VARIANCE;
  const playerRoll = hunt.power * roll();
  const beastRoll = beast.power * roll();
  const sieg = playerRoll >= beastRoll;

  const lossPct = sieg
    ? Math.min(HUNT_WIN_MAX_LOSS, Math.max(0, 0.25 / (playerRoll / beastRoll) - 0.05))
    : HUNT_LOSS_PCT;
  const gleiterVerloren = Math.min(hunt.gleiter, Math.floor(hunt.gleiter * lossPct));
  const gleiterZurueck = hunt.gleiter - gleiterVerloren;

  const bonus =
    (1 + BLESSING_LOOT_BONUS * state.blessings.weitblick) *
    (1 + TOWER_LOOT_BONUS_PER_LEVEL * Math.max(0, state.buildings.wachtturm - 1));
  const lootFactor = (sieg ? 1 : HUNT_CONSOLATION_LOOT) * bonus;

  const loot = cloneResources(ZERO_RESOURCES);
  for (const [resource, base] of Object.entries(beast.loot)) {
    loot[resource as keyof Resources] = Math.floor(base * lootFactor);
  }
  loot.aether = sieg ? Math.round(beast.aether * bonus) : 0;

  const s = cloneState(state);
  credit(s, loot);
  s.gleiter += gleiterZurueck;
  s.hunts = s.hunts.filter((h) => h.id !== huntId);
  s.huntsResolved += 1;
  if (sieg) s.huntsWon += 1;
  addChronicle(s, now, sieg ? 'huntWon' : 'huntLost', {
    beast: hunt.beast,
    verloren: gleiterVerloren,
  });

  return {
    ok: true,
    state: s,
    result: { beast: hunt.beast, sieg, loot, gleiterVerloren, gleiterZurueck },
  };
}

// ---------------------------------------------------------------------------
// Erkundung
// ---------------------------------------------------------------------------

/** Einen Aetherfunken der Welt einsammeln (Erkundungsmodus). */
export function collectSpark(
  state: GameState,
  sparkIndex: number,
  now: number,
): ActionResult<{ amount: number }> {
  const window = exploreWindowAt(now);
  const spark = sparksForWindow(window).find((s) => s.index === sparkIndex);
  if (!spark) return { ok: false, error: 'invalidChoice' };

  const collected =
    state.exploration.window === window ? state.exploration.collected : [];
  if (collected.includes(sparkIndex)) return { ok: false, error: 'invalidChoice' };

  const s = cloneState(state);
  s.exploration = { window, collected: [...collected, sparkIndex] };
  credit(s, { ...ZERO_RESOURCES, aether: spark.amount });
  return { ok: true, state: s, result: { amount: spark.amount } };
}

export function claimQuest(state: GameState, now: number): ActionResult {
  const quest = currentQuest(state);
  if (!quest || !conditionMet(state, quest.condition)) {
    return { ok: false, error: 'questNotReady' };
  }

  const s = cloneState(state);
  const reward = cloneResources(ZERO_RESOURCES);
  for (const [resource, amount] of Object.entries(quest.reward)) {
    reward[resource as keyof Resources] = amount;
  }
  credit(s, reward);
  s.questIndex += 1;
  addChronicle(s, now, 'questDone', { quest: quest.id });
  return { ok: true, state: s };
}

export function buyBlessing(
  state: GameState,
  blessing: BlessingId,
  now: number,
): ActionResult {
  const def = BLESSINGS[blessing];
  const level = state.blessings[blessing];
  if (level >= def.maxLevel) return { ok: false, error: 'blessingMax' };
  const cost = def.costs[level];
  if (cost === undefined || state.resources.aether < cost) {
    return { ok: false, error: 'notEnoughAether' };
  }

  const s = cloneState(state);
  s.resources.aether -= cost;
  s.blessings[blessing] = level + 1;
  addChronicle(s, now, 'blessing', { blessing, level: level + 1 });
  return { ok: true, state: s };
}

export function renameIsland(state: GameState, name: string): ActionResult {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_ISLAND_NAME_LENGTH) {
    return { ok: false, error: 'invalidName' };
  }
  return { ok: true, state: { ...cloneState(state), islandName: trimmed } };
}

/** Fortschritt der Quest-Kette, z. B. „4 / 13". */
export function questProgress(state: GameState): { done: number; total: number } {
  return { done: Math.min(state.questIndex, QUESTS.length), total: QUESTS.length };
}
