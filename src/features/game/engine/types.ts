/**
 * Zentrale Typen der Spiel-Engine.
 * Die Engine ist reines TypeScript ohne React/Expo-Abhängigkeiten:
 * Zustand rein, neuer Zustand raus. Dadurch ist jede Spielregel
 * deterministisch und unit-testbar.
 */

/** Die vier Ressourcen der Welt. */
export type ResourceId = 'korn' | 'holz' | 'stein' | 'aether';

export type Resources = Record<ResourceId, number>;

export type BuildingId =
  | 'himmelsdock'
  | 'windmuehle'
  | 'hain'
  | 'nebelbruch'
  | 'speicher'
  | 'wachtturm'
  | 'werft'
  | 'kollektor';

export type WeatherId = 'klar' | 'nebelbank' | 'sturmfront' | 'aetherregen';

export type ExpeditionTierId =
  'naheInseln' | 'nebelmeer' | 'sturmguertel' | 'vergesseneHoehen';

export type BlessingId =
  'rueckenwind' | 'fleissigeHaende' | 'weitblick' | 'zweiterBautrupp';

/** Ein laufender Ausbau in der Bau-Warteschlange. */
export type BuildTask = {
  building: BuildingId;
  targetLevel: number;
  startedAt: number;
  finishesAt: number;
};

/**
 * Eine Expedition. Nach Ablauf der Reisezeit wechselt sie auf
 * 'ereignis' und wartet auf die Entscheidung des Spielers.
 */
export type Expedition = {
  id: string;
  tier: ExpeditionTierId;
  gleiter: number;
  startedAt: number;
  finishesAt: number;
  /** Deterministischer Seed – bestimmt Ereignis und Ausgang. */
  seed: number;
  eventId: string;
  status: 'unterwegs' | 'ereignis';
};

/** Ergebnis einer aufgelösten Expedition (für die Ergebnis-Anzeige). */
export type ExpeditionResult = {
  eventId: string;
  choiceId: string;
  outcomeId: string;
  loot: Resources;
  gleiterVerloren: number;
  gleiterZurueck: number;
};

/** Eintrag in der Inselchronik (Texte via i18n-Schlüssel). */
export type ChronicleEntry = {
  at: number;
  key: string;
  params?: Record<string, string | number>;
};

/** Zusammenfassung dessen, was seit dem letzten Öffnen passiert ist. */
export type OfflineSummary = {
  elapsedMs: number;
  gained: Resources;
  buildsFinished: number;
  expeditionsArrived: number;
};

export type GameState = {
  version: number;
  createdAt: number;
  lastTick: number;
  islandName: string;
  resources: Resources;
  /** Insgesamt jemals gesammelte Ressourcen (für Aufgaben & Statistik). */
  lifetime: Resources;
  buildings: Record<BuildingId, number>;
  queue: BuildTask[];
  /** Gleiter, die aktuell auf der Insel sind (nicht unterwegs). */
  gleiter: number;
  /** Zähler aller jemals gestarteten Expeditionen (für Seeds). */
  expeditionsStarted: number;
  expeditionsResolved: number;
  expeditions: Expedition[];
  /** Index der aktuell aktiven Aufgabe in der Quest-Kette. */
  questIndex: number;
  blessings: Record<BlessingId, number>;
  chronicle: ChronicleEntry[];
};

/** Fehlercodes für Spieler-Aktionen (Anzeige via i18n). */
export type ActionError =
  | 'notEnoughResources'
  | 'notEnoughAether'
  | 'queueFull'
  | 'dockLimit'
  | 'maxLevel'
  | 'locked'
  | 'notEnoughGleiter'
  | 'gleiterCap'
  | 'towerTooLow'
  | 'expeditionSlotsFull'
  | 'expeditionNotReady'
  | 'invalidChoice'
  | 'questNotReady'
  | 'blessingMax'
  | 'invalidName';

export type ActionResult<Extra = undefined> =
  | (Extra extends undefined
      ? { ok: true; state: GameState }
      : { ok: true; state: GameState; result: Extra })
  | { ok: false; error: ActionError };
