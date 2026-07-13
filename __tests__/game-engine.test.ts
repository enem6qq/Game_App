/**
 * Tests für die Spiel-Engine: Produktion, Bau, Expeditionen,
 * Aufgaben, Segen und Offline-Fortschritt.
 */
import {
  BEASTS,
  BLESSING_BUILD_TIME_FACTOR,
  EXPEDITION_TIERS,
  GAME_STATE_VERSION,
  GLEITER_COST,
  OFFLINE_CAP_MS,
  QUESTS,
  advance,
  baseRatesPerHour,
  buildTimeMs,
  buildingRatePerHour,
  buyBlessing,
  claimQuest,
  collectSpark,
  createInitialState,
  effectiveLevel,
  exploreWindowAt,
  expeditionSlots,
  formatAmount,
  formatDuration,
  getEvent,
  gleiterCap,
  gleiterPowerPerUnit,
  migrateGameState,
  productionBetween,
  queueSlots,
  questClaimable,
  remainingSparks,
  renameIsland,
  resolveExpedition,
  resolveHunt,
  sparksForWindow,
  startExpedition,
  startHunt,
  startUpgrade,
  storageCap,
  totalGleiter,
  trainGleiter,
  upgradeCost,
  type GameState,
} from '@/features/game/engine';

const T0 = 1_700_000_000_000;

/** Bequemer Zustands-Baukasten für Tests (verschachtelte Teilwerte erlaubt). */
type StatePatch = Omit<Partial<GameState>, 'resources' | 'buildings' | 'blessings'> & {
  resources?: Partial<GameState['resources']>;
  buildings?: Partial<GameState['buildings']>;
  blessings?: Partial<GameState['blessings']>;
};

function makeState(patch: StatePatch = {}): GameState {
  const state = createInitialState(T0);
  return {
    ...state,
    ...patch,
    resources: { ...state.resources, ...patch.resources },
    buildings: { ...state.buildings, ...patch.buildings },
    blessings: { ...state.blessings, ...patch.blessings },
  };
}

// ---------------------------------------------------------------------------
// Produktion & Formeln
// ---------------------------------------------------------------------------

describe('Produktionsformeln', () => {
  it('Windmühle Stufe 1 produziert exakt den Basiswert', () => {
    expect(buildingRatePerHour('windmuehle', 1)).toBe(120);
  });

  it('höhere Stufen produzieren überproportional mehr', () => {
    expect(buildingRatePerHour('windmuehle', 2)).toBeCloseTo(120 * 2 * 1.15);
    expect(buildingRatePerHour('windmuehle', 3)).toBeGreaterThan(
      buildingRatePerHour('windmuehle', 2) * 1.4,
    );
  });

  it('Gebäude ohne Produktion liefern 0', () => {
    expect(buildingRatePerHour('speicher', 5)).toBe(0);
  });

  it('Rückenwind-Segen erhöht alle Grundraten um 10 % je Stufe', () => {
    const base = baseRatesPerHour(makeState());
    const blessed = baseRatesPerHour(makeState({ blessings: { rueckenwind: 2 } }));
    expect(blessed.korn).toBeCloseTo(base.korn * 1.2);
    expect(blessed.holz).toBeCloseTo(base.holz * 1.2);
  });

  it('Ausbaukosten wachsen mit Faktor 1,55 pro Stufe', () => {
    const l1 = upgradeCost('windmuehle', 1);
    const l2 = upgradeCost('windmuehle', 2);
    expect(l1.holz).toBe(50);
    expect(l2.holz).toBe(Math.floor(50 * 1.55));
  });

  it('Fleißige Hände verkürzt die Bauzeit', () => {
    const normal = buildTimeMs(makeState(), 'windmuehle', 2);
    const blessed = buildTimeMs(
      makeState({ blessings: { fleissigeHaende: 1 } }),
      'windmuehle',
      2,
    );
    expect(blessed).toBe(Math.round(normal * BLESSING_BUILD_TIME_FACTOR));
  });
});

describe('productionBetween (Fenster-Slicing)', () => {
  it('ist additiv: [a,c] = [a,b] + [b,c]', () => {
    const state = makeState();
    const a = T0;
    const b = T0 + 47 * 60_000;
    const c = T0 + 3 * 3_600_000;
    const whole = productionBetween(state, a, c);
    const part1 = productionBetween(state, a, b);
    const part2 = productionBetween(state, b, c);
    expect(whole.korn).toBeCloseTo(part1.korn + part2.korn, 6);
    expect(whole.holz).toBeCloseTo(part1.holz + part2.holz, 6);
    expect(whole.stein).toBeCloseTo(part1.stein + part2.stein, 6);
    expect(whole.aether).toBeCloseTo(part1.aether + part2.aether, 6);
  });

  it('liefert 0 für leere oder negative Zeiträume', () => {
    const state = makeState();
    expect(productionBetween(state, T0, T0).korn).toBe(0);
    expect(productionBetween(state, T0, T0 - 1000).korn).toBe(0);
  });

  it('produziert nichts ohne Produktionsgebäude', () => {
    const state = makeState({
      buildings: { windmuehle: 0, hain: 0, nebelbruch: 0, kollektor: 0 },
    });
    const gained = productionBetween(state, T0, T0 + 3_600_000);
    expect(gained.korn).toBe(0);
    expect(gained.holz).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// advance: Zeit, Bau-Abschluss, Lager, Offline-Cap
// ---------------------------------------------------------------------------

describe('advance', () => {
  it('tut nichts, wenn keine Zeit vergangen ist', () => {
    const state = makeState();
    const { state: after } = advance(state, T0);
    expect(after).toBe(state);
  });

  it('schreibt Produktion gut und aktualisiert lastTick', () => {
    const state = makeState();
    const { state: after, summary } = advance(state, T0 + 30 * 60_000);
    expect(after.lastTick).toBe(T0 + 30 * 60_000);
    expect(after.resources.korn).toBeGreaterThan(state.resources.korn);
    expect(summary.gained.korn).toBeGreaterThan(0);
    expect(after.lifetime.korn).toBeCloseTo(summary.gained.korn, 6);
  });

  it('respektiert das Lagerlimit (Speicher Stufe 0 = 400)', () => {
    const state = makeState({ resources: { korn: 395 } });
    expect(storageCap(state)).toBe(400);
    const { state: after } = advance(state, T0 + 2 * 3_600_000);
    expect(after.resources.korn).toBe(400);
    // lifetime zählt nur, was wirklich angekommen ist:
    expect(after.lifetime.korn).toBeCloseTo(5, 6);
  });

  it('schließt fällige Bauten ab und produziert ab dann mit neuer Stufe', () => {
    const finishAt = T0 + 3_600_000;
    // Großer Speicher, damit das Lagerlimit die Rechnung nicht kappt.
    const state = makeState({
      buildings: { speicher: 5 },
      queue: [
        {
          building: 'windmuehle',
          targetLevel: 2,
          startedAt: T0,
          finishesAt: finishAt,
        },
      ],
    });
    const end = T0 + 2 * 3_600_000;
    const { state: after, summary } = advance(state, end);

    expect(after.buildings.windmuehle).toBe(2);
    expect(after.queue).toHaveLength(0);
    expect(summary.buildsFinished).toBe(1);

    // Erwartung: Stufe 1 bis zum Abschluss, danach Stufe 2.
    const stateL2 = makeState({ buildings: { windmuehle: 2, speicher: 5 } });
    const expected =
      productionBetween(state, T0, finishAt).korn +
      productionBetween(stateL2, finishAt, end).korn;
    expect(summary.gained.korn).toBeCloseTo(expected, 4);
  });

  it('rechnet offline höchstens OFFLINE_CAP_MS an', () => {
    // Großer Speicher, damit das Lagerlimit die Rechnung nicht kappt.
    const state = makeState({ buildings: { speicher: 6 } });
    const end = T0 + 20 * 3_600_000; // 20 h weg
    const { state: after } = advance(state, end);

    const expected = productionBetween(state, end - OFFLINE_CAP_MS, end).korn;
    expect(after.resources.korn - state.resources.korn).toBeCloseTo(expected, 4);
  });

  it('meldet angekommene Expeditionen als Ereignis', () => {
    let state = makeState({
      resources: { korn: 500, holz: 500 },
      buildings: { wachtturm: 1, werft: 1 },
      gleiter: 3,
    });
    const started = startExpedition(state, 'naheInseln', T0);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    state = started.state;

    const { state: after, summary } = advance(state, T0 + 16 * 60_000);
    expect(after.expeditions[0]?.status).toBe('ereignis');
    expect(summary.expeditionsArrived).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Bauen
// ---------------------------------------------------------------------------

describe('startUpgrade', () => {
  it('startet einen bezahlbaren Ausbau und zieht die Kosten ab', () => {
    const state = makeState({ buildings: { himmelsdock: 2 } });
    const result = startUpgrade(state, 'windmuehle', T0);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const cost = upgradeCost('windmuehle', 2);
    expect(result.state.resources.holz).toBe(state.resources.holz - cost.holz);
    expect(result.state.queue[0]?.targetLevel).toBe(2);
    expect(effectiveLevel(result.state, 'windmuehle')).toBe(2);
  });

  it('das Dock selbst ist mit den Startvorräten sofort ausbaubar', () => {
    const result = startUpgrade(makeState(), 'himmelsdock', T0);
    expect(result.ok).toBe(true);
  });

  it('verweigert bei zu wenig Ressourcen', () => {
    const state = makeState({ resources: { korn: 0, holz: 0, stein: 0 } });
    const result = startUpgrade(state, 'himmelsdock', T0);
    expect(result).toEqual({ ok: false, error: 'notEnoughResources' });
  });

  it('verweigert gesperrte Gebäude (Kollektor braucht Dock 3)', () => {
    const state = makeState({ resources: { korn: 9999, holz: 9999, stein: 9999 } });
    expect(startUpgrade(state, 'kollektor', T0)).toEqual({
      ok: false,
      error: 'locked',
    });
  });

  it('lässt kein Gebäude über die Dock-Stufe hinaus wachsen', () => {
    const state = makeState({
      resources: { korn: 99999, holz: 99999, stein: 99999 },
      buildings: { windmuehle: 1 },
    });
    // Dock ist Stufe 1, Windmühle auf 2 wäre höher als das Dock.
    expect(startUpgrade(state, 'windmuehle', T0)).toEqual({
      ok: false,
      error: 'dockLimit',
    });
  });

  it('erlaubt nur einen Bau gleichzeitig (ohne Segen)', () => {
    const state = makeState({
      resources: { korn: 99999, holz: 99999, stein: 99999 },
      buildings: { himmelsdock: 3 },
    });
    expect(queueSlots(state)).toBe(1);
    const first = startUpgrade(state, 'windmuehle', T0);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(startUpgrade(first.state, 'hain', T0)).toEqual({
      ok: false,
      error: 'queueFull',
    });
  });

  it('erlaubt zwei Bauten mit dem Segen „Zweiter Bautrupp"', () => {
    const state = makeState({
      resources: { korn: 99999, holz: 99999, stein: 99999 },
      buildings: { himmelsdock: 3 },
      blessings: { zweiterBautrupp: 1 },
    });
    const first = startUpgrade(state, 'windmuehle', T0);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = startUpgrade(first.state, 'hain', T0);
    expect(second.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Gleiter & Expeditionen
// ---------------------------------------------------------------------------

describe('Gleiter', () => {
  it('braucht eine Werft', () => {
    expect(trainGleiter(makeState(), 1, T0)).toEqual({ ok: false, error: 'locked' });
  });

  it('bildet Gleiter gegen Kosten aus und respektiert das Limit', () => {
    const state = makeState({
      resources: { korn: 1000, holz: 1000 },
      buildings: { werft: 1 },
    });
    expect(gleiterCap(state)).toBe(5);

    const result = trainGleiter(state, 3, T0);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.gleiter).toBe(3);
    expect(result.state.resources.korn).toBe(1000 - 3 * GLEITER_COST.korn);

    expect(trainGleiter(result.state, 3, T0)).toEqual({
      ok: false,
      error: 'gleiterCap',
    });
  });
});

describe('Expeditionen', () => {
  function readyState(): GameState {
    return makeState({
      resources: { korn: 1000, holz: 1000, stein: 500 },
      buildings: { himmelsdock: 2, wachtturm: 1, werft: 1 },
      gleiter: 5,
    });
  }

  it('verlangt den passenden Wachtturm', () => {
    expect(startExpedition(readyState(), 'nebelmeer', T0)).toEqual({
      ok: false,
      error: 'towerTooLow',
    });
  });

  it('verlangt genug Gleiter', () => {
    const state = { ...readyState(), gleiter: 1 };
    expect(startExpedition(state, 'naheInseln', T0)).toEqual({
      ok: false,
      error: 'notEnoughGleiter',
    });
  });

  it('startet, bindet Gleiter und belegt den Expeditionsplatz', () => {
    const state = readyState();
    expect(expeditionSlots(state)).toBe(1);

    const result = startExpedition(state, 'naheInseln', T0);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const expedition = result.state.expeditions[0]!;
    expect(result.state.gleiter).toBe(5 - EXPEDITION_TIERS.naheInseln.gleiter);
    expect(expedition.status).toBe('unterwegs');
    expect(getEvent(expedition.eventId)).toBeDefined();

    expect(startExpedition(result.state, 'naheInseln', T0)).toEqual({
      ok: false,
      error: 'expeditionSlotsFull',
    });
  });

  it('lässt sich erst nach Ankunft auflösen und ist deterministisch', () => {
    const started = startExpedition(readyState(), 'naheInseln', T0);
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const expedition = started.state.expeditions[0]!;
    const choice = getEvent(expedition.eventId)!.choices[0]!;

    // Unterwegs: noch nicht auflösbar.
    expect(resolveExpedition(started.state, expedition.id, choice.id, T0)).toEqual({
      ok: false,
      error: 'expeditionNotReady',
    });

    // Ankommen lassen und auflösen.
    const arrivedAt = expedition.finishesAt + 1000;
    const { state: arrived } = advance(started.state, arrivedAt);
    const a = resolveExpedition(arrived, expedition.id, choice.id, arrivedAt);
    const b = resolveExpedition(arrived, expedition.id, choice.id, arrivedAt);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (!a.ok || !b.ok) return;

    // Gleicher Seed ⇒ identisches Ergebnis.
    expect(a.result).toEqual(b.result);

    // Buchhaltung stimmt: verloren + zurück = ausgesandt.
    expect(a.result.gleiterVerloren + a.result.gleiterZurueck).toBe(
      EXPEDITION_TIERS.naheInseln.gleiter,
    );
    expect(a.state.expeditionsResolved).toBe(1);
    expect(a.state.expeditions).toHaveLength(0);
    expect(a.state.gleiter).toBe(arrived.gleiter + a.result.gleiterZurueck);
  });

  it('Wachtturm-Stufe erhöht die Beute', () => {
    const low = startExpedition(readyState(), 'naheInseln', T0);
    const highState = {
      ...readyState(),
      buildings: { ...readyState().buildings, himmelsdock: 5, wachtturm: 4 },
    };
    const high = startExpedition(highState, 'naheInseln', T0);
    expect(low.ok && high.ok).toBe(true);
    if (!low.ok || !high.ok) return;

    // Beide auf dasselbe Ereignis/Seed zwingen, damit nur der Bonus differiert.
    const lowExp = { ...low.state.expeditions[0]!, status: 'ereignis' as const };
    const highExp = {
      ...high.state.expeditions[0]!,
      status: 'ereignis' as const,
      seed: lowExp.seed,
      eventId: lowExp.eventId,
    };
    const lowReady = { ...low.state, expeditions: [lowExp] };
    const highReady = { ...high.state, expeditions: [highExp] };

    const choice = getEvent(lowExp.eventId)!.choices[0]!;
    const lowRes = resolveExpedition(lowReady, lowExp.id, choice.id, T0 + 1);
    const highRes = resolveExpedition(highReady, highExp.id, choice.id, T0 + 1);
    expect(lowRes.ok && highRes.ok).toBe(true);
    if (!lowRes.ok || !highRes.ok) return;
    expect(highRes.result.loot.korn).toBeGreaterThan(lowRes.result.loot.korn);
  });
});

// ---------------------------------------------------------------------------
// Aufgaben & Segen
// ---------------------------------------------------------------------------

describe('Aufgaben', () => {
  it('erste Aufgabe: Himmelsdock Stufe 2 (lehrt die Dock-Regel)', () => {
    const state = makeState();
    expect(QUESTS[0]!.id).toBe('dock2');
    expect(questClaimable(state)).toBe(false);
    expect(claimQuest(state, T0)).toEqual({ ok: false, error: 'questNotReady' });

    const done = makeState({ buildings: { himmelsdock: 2 } });
    expect(questClaimable(done)).toBe(true);

    const claimed = claimQuest(done, T0);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) return;
    expect(claimed.state.questIndex).toBe(1);
    expect(claimed.state.resources.aether).toBe(
      done.resources.aether + (QUESTS[0]!.reward.aether ?? 0),
    );
  });

  it('die Kette endet sauber nach der letzten Aufgabe', () => {
    const state = makeState({ questIndex: QUESTS.length });
    expect(questClaimable(state)).toBe(false);
    expect(claimQuest(state, T0)).toEqual({ ok: false, error: 'questNotReady' });
  });
});

describe('Segen', () => {
  it('verlangt genug Aether', () => {
    expect(buyBlessing(makeState(), 'rueckenwind', T0)).toEqual({
      ok: false,
      error: 'notEnoughAether',
    });
  });

  it('kauft Stufen bis zum Maximum', () => {
    let state = makeState({ resources: { aether: 500 } });
    for (let i = 0; i < 3; i++) {
      const result = buyBlessing(state, 'rueckenwind', T0);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      state = result.state;
    }
    expect(state.blessings.rueckenwind).toBe(3);
    expect(buyBlessing(state, 'rueckenwind', T0)).toEqual({
      ok: false,
      error: 'blessingMax',
    });
    // 20 + 50 + 120 Aether ausgegeben:
    expect(state.resources.aether).toBe(500 - 190);
  });
});

// ---------------------------------------------------------------------------
// Verschiedenes
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Bestienjagd
// ---------------------------------------------------------------------------

describe('Bestienjagd', () => {
  function hunterState(): GameState {
    return makeState({
      buildings: { himmelsdock: 3, wachtturm: 2, werft: 2 },
      gleiter: 8,
    });
  }

  it('Kampfkraft je Gleiter steigt mit der Werft', () => {
    expect(gleiterPowerPerUnit(makeState({ buildings: { werft: 1 } }))).toBe(10);
    expect(gleiterPowerPerUnit(makeState({ buildings: { werft: 3 } }))).toBe(14);
  });

  it('verlangt den passenden Wachtturm und genug Gleiter', () => {
    expect(startHunt(makeState(), 'nebelschlange', T0)).toEqual({
      ok: false,
      error: 'towerTooLow',
    });
    const weak = { ...hunterState(), gleiter: 2 };
    expect(startHunt(weak, 'nebelschlange', T0)).toEqual({
      ok: false,
      error: 'notEnoughGleiter',
    });
  });

  it('erlaubt nur eine Jagd gleichzeitig und bindet die Gleiter', () => {
    const started = startHunt(hunterState(), 'nebelschlange', T0);
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    expect(started.state.gleiter).toBe(8 - BEASTS.nebelschlange.gleiter);
    expect(totalGleiter(started.state)).toBe(8);
    expect(started.state.hunts[0]?.power).toBe(
      BEASTS.nebelschlange.gleiter * gleiterPowerPerUnit(hunterState()),
    );
    expect(startHunt(started.state, 'nebelschlange', T0)).toEqual({
      ok: false,
      error: 'huntActive',
    });
  });

  it('lässt sich erst nach dem Kampf auflösen und ist deterministisch', () => {
    const started = startHunt(hunterState(), 'nebelschlange', T0);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const hunt = started.state.hunts[0]!;

    expect(resolveHunt(started.state, hunt.id, T0)).toEqual({
      ok: false,
      error: 'huntNotReady',
    });

    const later = hunt.finishesAt + 1;
    const a = resolveHunt(started.state, hunt.id, later);
    const b = resolveHunt(started.state, hunt.id, later);
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;

    expect(a.result).toEqual(b.result);
    expect(a.result.gleiterVerloren + a.result.gleiterZurueck).toBe(
      BEASTS.nebelschlange.gleiter,
    );
    expect(a.state.hunts).toHaveLength(0);
    expect(a.state.huntsResolved).toBe(1);
    expect(a.state.huntsWon).toBe(a.result.sieg ? 1 : 0);
    if (a.result.sieg) {
      expect(a.result.loot.aether).toBeGreaterThan(0);
    } else {
      expect(a.result.loot.aether).toBe(0);
    }
  });

  it('ein übermächtiger Trupp gewinnt garantiert (Würfelspanne reicht nicht)', () => {
    // Kraft weit über Bestie × 1,15/0,85 – Sieg unabhängig vom Seed.
    const started = startHunt(
      makeState({
        buildings: { himmelsdock: 10, wachtturm: 6, werft: 10 },
        gleiter: 30,
      }),
      'nebelschlange',
      T0,
    );
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const hunt = started.state.hunts[0]!;
    const result = resolveHunt(started.state, hunt.id, hunt.finishesAt + 1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.result.sieg).toBe(true);
  });
});

describe('Erkundung (Aetherfunken)', () => {
  it('Funken sind pro Fenster deterministisch und im Weltbereich', () => {
    const w = exploreWindowAt(T0);
    const a = sparksForWindow(w);
    const b = sparksForWindow(w);
    expect(a).toEqual(b);
    for (const spark of a) {
      expect(spark.x).toBeGreaterThan(0);
      expect(spark.amount).toBeGreaterThanOrEqual(1);
      expect(spark.amount).toBeLessThanOrEqual(3);
    }
  });

  it('sammelt Funken genau einmal und schreibt Aether gut', () => {
    const state = makeState();
    const spark = remainingSparks(state, T0)[0]!;

    const first = collectSpark(state, spark.index, T0);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.result.amount).toBe(spark.amount);
    expect(first.state.resources.aether).toBe(spark.amount);
    expect(remainingSparks(first.state, T0)).toHaveLength(
      remainingSparks(state, T0).length - 1,
    );

    expect(collectSpark(first.state, spark.index, T0)).toEqual({
      ok: false,
      error: 'invalidChoice',
    });
  });

  it('im nächsten Fenster sind wieder alle Funken da', () => {
    const state = makeState();
    const spark = remainingSparks(state, T0)[0]!;
    const collected = collectSpark(state, spark.index, T0);
    expect(collected.ok).toBe(true);
    if (!collected.ok) return;

    const nextWindow = T0 + 2 * 60 * 60 * 1000;
    expect(remainingSparks(collected.state, nextWindow)).toHaveLength(6);
  });
});

describe('Spielstand-Migration', () => {
  it('füllt fehlende Felder älterer Spielstände auf', () => {
    const old = makeState() as Partial<GameState> & Record<string, unknown>;
    delete old.hunts;
    delete old.huntsStarted;
    delete old.huntsResolved;
    delete old.huntsWon;

    const migrated = migrateGameState(old, T0 + 1000);
    expect(migrated.version).toBe(GAME_STATE_VERSION);
    expect(migrated.hunts).toEqual([]);
    expect(migrated.huntsResolved).toBe(0);
    // Bestehende Daten bleiben erhalten:
    expect(migrated.resources.korn).toBe(150);
    expect(migrated.buildings.himmelsdock).toBe(1);
  });

  it('erzeugt aus nichts einen frischen Spielstand', () => {
    const migrated = migrateGameState(undefined, T0);
    expect(migrated.buildings.windmuehle).toBe(1);
    expect(migrated.hunts).toEqual([]);
  });
});

describe('Insel umbenennen', () => {
  it('akzeptiert normale Namen und trimmt sie', () => {
    const result = renameIsland(makeState(), '  Nimbusgarten  ');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.islandName).toBe('Nimbusgarten');
  });

  it('verweigert leere und überlange Namen', () => {
    expect(renameIsland(makeState(), '   ')).toEqual({
      ok: false,
      error: 'invalidName',
    });
    expect(renameIsland(makeState(), 'x'.repeat(30))).toEqual({
      ok: false,
      error: 'invalidName',
    });
  });
});

describe('Formatierung', () => {
  it('formatiert Mengen kompakt', () => {
    expect(formatAmount(999)).toBe('999');
    expect(formatAmount(12_345)).toBe('12,3k');
    expect(formatAmount(2_500_000)).toBe('2,5M');
  });

  it('formatiert Zeitspannen lesbar', () => {
    expect(formatDuration(62_000)).toBe('1:02');
    expect(formatDuration(3_723_000)).toBe('1 h 2 min');
    expect(formatDuration(90_061_000)).toBe('1 d 1 h');
  });
});
