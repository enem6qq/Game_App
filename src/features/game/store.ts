/**
 * Spielstand-Store (Zustand + persist).
 * Der Store ist eine dünne Hülle um die Engine: Er hält den GameState,
 * speichert ihn automatisch auf dem Gerät und reicht Aktionen durch.
 * Sämtliche Spielregeln leben in der Engine – hier steht KEINE Logik.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  GAME_STATE_VERSION,
  advance,
  buyBlessing,
  claimQuest,
  collectSpark,
  createInitialState,
  migrateGameState,
  renameIsland,
  resolveExpedition,
  resolveHunt,
  startExpedition,
  startHunt,
  startUpgrade,
  trainGleiter,
  type ActionError,
  type BeastId,
  type BlessingId,
  type BuildingId,
  type ExpeditionResult,
  type ExpeditionTierId,
  type GameState,
  type HuntResult,
  type OfflineSummary,
} from './engine';

/** Ab dieser Abwesenheit zeigen wir die „Willkommen zurück"-Übersicht. */
const OFFLINE_SUMMARY_MIN_MS = 5 * 60 * 1000;

type GameStore = {
  state: GameState;
  /** Letzter Aktions-Fehler (für eine kurze Hinweis-Einblendung). */
  lastError: ActionError | null;
  /** Ergebnis der zuletzt aufgelösten Expedition (für die Ergebnis-Karte). */
  lastExpeditionResult: ExpeditionResult | null;
  /** Bericht der zuletzt aufgelösten Bestienjagd. */
  lastHuntResult: HuntResult | null;
  /** Zusammenfassung nach längerer Abwesenheit (für das Willkommen-Modal). */
  offlineSummary: OfflineSummary | null;

  /** Treibt die Zeit voran – wird vom Sekunden-Tick aufgerufen. */
  tick: (nowMs?: number) => void;

  upgrade: (building: BuildingId) => void;
  train: (count: number) => void;
  sendExpedition: (tier: ExpeditionTierId) => void;
  chooseExpeditionOption: (expeditionId: string, choiceId: string) => void;
  sendHunt: (beast: BeastId) => void;
  openHuntReport: (huntId: string) => void;
  pickUpSpark: (sparkIndex: number) => void;
  claimQuestReward: () => void;
  purchaseBlessing: (blessing: BlessingId) => void;
  setIslandName: (name: string) => void;

  /** Kompletten Spielstand ersetzen (Cloud-Laden). */
  replaceState: (state: GameState) => void;

  dismissError: () => void;
  dismissExpeditionResult: () => void;
  dismissHuntResult: () => void;
  dismissOfflineSummary: () => void;
  /** Kompletter Neustart (Einstellungen → Spielstand löschen). */
  resetGame: () => void;
};

type EngineAction = { ok: true; state: GameState } | { ok: false; error: ActionError };

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      /** Aktion anwenden: Zustand übernehmen oder Fehler merken. */
      const apply = (result: EngineAction) => {
        if (result.ok) set({ state: result.state, lastError: null });
        else set({ lastError: result.error });
      };

      return {
        state: createInitialState(Date.now()),
        lastError: null,
        lastExpeditionResult: null,
        lastHuntResult: null,
        offlineSummary: null,

        tick: (nowMs = Date.now()) => {
          const previous = get().state;
          const { state, summary } = advance(previous, nowMs);
          if (state === previous) return;
          if (summary.elapsedMs >= OFFLINE_SUMMARY_MIN_MS) {
            set({ state, offlineSummary: summary });
          } else {
            set({ state });
          }
        },

        upgrade: (building) => apply(startUpgrade(get().state, building, Date.now())),

        train: (count) => apply(trainGleiter(get().state, count, Date.now())),

        sendExpedition: (tier) => apply(startExpedition(get().state, tier, Date.now())),

        chooseExpeditionOption: (expeditionId, choiceId) => {
          const result = resolveExpedition(
            get().state,
            expeditionId,
            choiceId,
            Date.now(),
          );
          if (result.ok) {
            set({
              state: result.state,
              lastExpeditionResult: result.result,
              lastError: null,
            });
          } else {
            set({ lastError: result.error });
          }
        },

        sendHunt: (beast) => apply(startHunt(get().state, beast, Date.now())),

        openHuntReport: (huntId) => {
          const result = resolveHunt(get().state, huntId, Date.now());
          if (result.ok) {
            set({ state: result.state, lastHuntResult: result.result, lastError: null });
          } else {
            set({ lastError: result.error });
          }
        },

        pickUpSpark: (sparkIndex) => {
          const result = collectSpark(get().state, sparkIndex, Date.now());
          // Doppel-Einsammeln still ignorieren (kein Fehler-Banner nötig).
          if (result.ok) set({ state: result.state });
        },

        claimQuestReward: () => apply(claimQuest(get().state, Date.now())),

        purchaseBlessing: (blessing) =>
          apply(buyBlessing(get().state, blessing, Date.now())),

        setIslandName: (name) => apply(renameIsland(get().state, name)),

        replaceState: (state) =>
          set({
            state,
            lastError: null,
            lastExpeditionResult: null,
            lastHuntResult: null,
            offlineSummary: null,
          }),

        dismissError: () => set({ lastError: null }),
        dismissExpeditionResult: () => set({ lastExpeditionResult: null }),
        dismissHuntResult: () => set({ lastHuntResult: null }),
        dismissOfflineSummary: () => set({ offlineSummary: null }),

        resetGame: () =>
          set({
            state: createInitialState(Date.now()),
            lastError: null,
            lastExpeditionResult: null,
            lastHuntResult: null,
            offlineSummary: null,
          }),
      };
    },
    {
      name: 'wolkenfeste-save',
      version: GAME_STATE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      // Nur der Spielstand wird gespeichert – UI-Zustände nicht.
      partialize: (store) => ({ state: store.state }),
      // Ältere Speicherstände auf die aktuelle Struktur heben.
      migrate: (persisted) => {
        const p = persisted as { state?: unknown } | undefined;
        return { state: migrateGameState(p?.state, Date.now()) };
      },
      // Nach dem Laden sofort die Offline-Zeit anrechnen.
      onRehydrateStorage: () => (store) => {
        if (store) store.tick(Date.now());
      },
    },
  ),
);
