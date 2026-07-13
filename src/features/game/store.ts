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
  createInitialState,
  renameIsland,
  resolveExpedition,
  startExpedition,
  startUpgrade,
  trainGleiter,
  type ActionError,
  type BlessingId,
  type BuildingId,
  type ExpeditionResult,
  type ExpeditionTierId,
  type GameState,
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
  /** Zusammenfassung nach längerer Abwesenheit (für das Willkommen-Modal). */
  offlineSummary: OfflineSummary | null;

  /** Treibt die Zeit voran – wird vom Sekunden-Tick aufgerufen. */
  tick: (nowMs?: number) => void;

  upgrade: (building: BuildingId) => void;
  train: (count: number) => void;
  sendExpedition: (tier: ExpeditionTierId) => void;
  chooseExpeditionOption: (expeditionId: string, choiceId: string) => void;
  claimQuestReward: () => void;
  purchaseBlessing: (blessing: BlessingId) => void;
  setIslandName: (name: string) => void;

  dismissError: () => void;
  dismissExpeditionResult: () => void;
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

        claimQuestReward: () => apply(claimQuest(get().state, Date.now())),

        purchaseBlessing: (blessing) =>
          apply(buyBlessing(get().state, blessing, Date.now())),

        setIslandName: (name) => apply(renameIsland(get().state, name)),

        dismissError: () => set({ lastError: null }),
        dismissExpeditionResult: () => set({ lastExpeditionResult: null }),
        dismissOfflineSummary: () => set({ offlineSummary: null }),

        resetGame: () =>
          set({
            state: createInitialState(Date.now()),
            lastError: null,
            lastExpeditionResult: null,
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
      // Nach dem Laden sofort die Offline-Zeit anrechnen.
      onRehydrateStorage: () => (store) => {
        if (store) store.tick(Date.now());
      },
    },
  ),
);
