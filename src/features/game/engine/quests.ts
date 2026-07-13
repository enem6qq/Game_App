/**
 * Aufgaben-Logik: prüft, ob die Bedingung einer Aufgabe erfüllt ist.
 */
import { QUESTS, type QuestCondition, type QuestDef } from './content';
import type { GameState } from './types';

/** Gleiter insgesamt (auf der Insel + unterwegs). */
export function totalGleiter(state: GameState): number {
  return state.gleiter + state.expeditions.reduce((sum, e) => sum + e.gleiter, 0);
}

export function conditionMet(state: GameState, condition: QuestCondition): boolean {
  switch (condition.type) {
    case 'building':
      return state.buildings[condition.building] >= condition.level;
    case 'lifetime':
      return state.lifetime[condition.resource] >= condition.amount;
    case 'gleiter':
      return totalGleiter(state) >= condition.count;
    case 'expeditions':
      return state.expeditionsResolved >= condition.count;
    case 'blessings': {
      const total = Object.values(state.blessings).reduce((a, b) => a + b, 0);
      return total >= condition.count;
    }
  }
}

/** Die aktuell aktive Aufgabe – oder undefined, wenn alle erledigt sind. */
export function currentQuest(state: GameState): QuestDef | undefined {
  return QUESTS[state.questIndex];
}

/** Ist die aktive Aufgabe erfüllt und ihre Belohnung abholbar? */
export function questClaimable(state: GameState): boolean {
  const quest = currentQuest(state);
  return quest !== undefined && conditionMet(state, quest.condition);
}
