/**
 * Expeditions-Ereignisse: 10 eigene, handgeschriebene Szenarien.
 * Jede Expedition endet mit genau einem Ereignis und 2–3 Entscheidungen.
 * Die Texte liegen in den Sprachdateien unter game.events.<id>.…,
 * hier stehen nur die Ausgänge mit Gewichten und Multiplikatoren.
 *
 * Faustregel fürs Balancing:
 *  – sicher:    kein Verlustrisiko, Beute ×0,8–1,1
 *  – riskant:   Beute bis ×2, aber Chance auf Verluste
 *  – neugierig: weniger Beute, dafür Aether-Chance
 */

export type EventOutcome = {
  id: string;
  weight: number;
  /** Multiplikator auf die Grund-Beute des Ziels. */
  lootMult: number;
  /** Multiplikator auf den Grund-Aether des Ziels. */
  aetherMult: number;
  /** Anteil der Gleiter, der verloren geht (0–1). */
  lossPct: number;
};

export type EventChoice = {
  id: string;
  outcomes: EventOutcome[];
};

export type EventDef = {
  id: string;
  emoji: string;
  choices: EventChoice[];
};

const outcome = (
  id: string,
  weight: number,
  lootMult: number,
  aetherMult: number,
  lossPct = 0,
): EventOutcome => ({ id, weight, lootMult, aetherMult, lossPct });

export const EVENTS: EventDef[] = [
  {
    // Ein Feld aus Treibgut der alten Welt schwebt im Aufwind.
    id: 'treibgutFeld',
    emoji: '🪵',
    choices: [
      {
        id: 'sichern',
        outcomes: [outcome('ruhigeHand', 100, 1.0, 0.5)],
      },
      {
        id: 'tauchen',
        outcomes: [
          outcome('reicheBergung', 55, 1.9, 1.0),
          outcome('abgestuerzt', 45, 0.6, 0.5, 0.2),
        ],
      },
    ],
  },
  {
    // Eine verlassene Himmelsmühle dreht sich noch immer im Wind.
    id: 'verlasseneMuehle',
    emoji: '🏚️',
    choices: [
      {
        id: 'vorraete',
        outcomes: [outcome('volleSaecke', 100, 1.15, 0.3)],
      },
      {
        id: 'keller',
        outcomes: [
          outcome('geheimlager', 50, 1.5, 1.6),
          outcome('morscheBalken', 50, 0.7, 0.6, 0.15),
        ],
      },
      {
        id: 'weiterziehen',
        outcomes: [outcome('sichererKurs', 100, 0.85, 0.8)],
      },
    ],
  },
  {
    // Lichter tanzen in der Nebelwand und locken die Gleiter.
    id: 'nebellichter',
    emoji: '✨',
    choices: [
      {
        id: 'folgen',
        outcomes: [
          outcome('aetherquelle', 45, 0.9, 3.0),
          outcome('irrlichter', 55, 0.5, 0.4, 0.25),
        ],
      },
      {
        id: 'kursHalten',
        outcomes: [outcome('planTreu', 100, 1.0, 0.6)],
      },
    ],
  },
  {
    // Fremde Gleiterreiter kreuzen den Kurs – Händler oder Halunken?
    id: 'sturmreiter',
    emoji: '🪂',
    choices: [
      {
        id: 'handeln',
        outcomes: [
          outcome('guterTausch', 70, 1.35, 1.2),
          outcome('uebersTischGezogen', 30, 0.75, 0.5),
        ],
      },
      {
        id: 'wettflug',
        outcomes: [
          outcome('gewonnen', 50, 1.8, 1.5),
          outcome('verloren', 50, 0.65, 0.4, 0.1),
        ],
      },
      {
        id: 'ausweichen',
        outcomes: [outcome('unbehelligt', 100, 0.9, 0.7)],
      },
    ],
  },
  {
    // Aus einem Felsspalt sprudelt reiner, flüssiger Aether.
    id: 'aetherquelle',
    emoji: '💧',
    choices: [
      {
        id: 'schoepfen',
        outcomes: [outcome('volleFlaschen', 100, 0.8, 2.2)],
      },
      {
        id: 'aufstauen',
        outcomes: [
          outcome('reicheErnte', 40, 0.9, 4.0),
          outcome('quelleVersiegt', 60, 0.7, 0.8),
        ],
      },
    ],
  },
  {
    // Die Ruine einer Bibliothek – Karten und Wissen der alten Welt.
    id: 'alteBibliothek',
    emoji: '📚',
    choices: [
      {
        id: 'kartenBergen',
        outcomes: [outcome('neueRouten', 100, 1.3, 1.0)],
      },
      {
        id: 'archivDurchsuchen',
        outcomes: [
          outcome('verboteneFormel', 45, 1.1, 2.5),
          outcome('staubUndAsche', 55, 0.8, 0.5),
        ],
      },
    ],
  },
  {
    // Eine Herde Wolkenwale zieht majestätisch vorbei.
    id: 'wolkenwale',
    emoji: '🐋',
    choices: [
      {
        id: 'imWindschatten',
        outcomes: [outcome('krautgaerten', 100, 1.4, 0.8)],
      },
      {
        id: 'anlanden',
        outcomes: [
          outcome('walruecken', 40, 1.7, 2.0),
          outcome('abgeschuettelt', 60, 0.6, 0.5, 0.15),
        ],
      },
      {
        id: 'ziehenLassen',
        outcomes: [outcome('stillerGruss', 100, 0.9, 1.0)],
      },
    ],
  },
  {
    // Eine gestrandete Händlerin bittet um Hilfe bei der Reparatur.
    id: 'gestrandeteHaendlerin',
    emoji: '🛶',
    choices: [
      {
        id: 'helfen',
        outcomes: [outcome('dankbarkeit', 100, 1.25, 1.4)],
      },
      {
        id: 'frachtKaufen',
        outcomes: [
          outcome('schnaeppchen', 60, 1.6, 0.8),
          outcome('ladenhueter', 40, 0.85, 0.4),
        ],
      },
    ],
  },
  {
    // Eine zerbrechende Splitterinsel voller Erzadern sinkt dem Wolkenmeer entgegen.
    id: 'splitterinsel',
    emoji: '🪨',
    choices: [
      {
        id: 'randAbbauen',
        outcomes: [outcome('sichereAusbeute', 100, 1.1, 0.5)],
      },
      {
        id: 'kernSprengen',
        outcomes: [
          outcome('erzregen', 45, 2.0, 1.2),
          outcome('kollaps', 55, 0.5, 0.3, 0.3),
        ],
      },
    ],
  },
  {
    // Ein stummer Turm der Alten ragt aus den Wolken – seine Tür steht offen.
    id: 'stillerTurm',
    emoji: '🗿',
    choices: [
      {
        id: 'schwelleWachen',
        outcomes: [outcome('friedlicherHandel', 100, 1.05, 1.1)],
      },
      {
        id: 'hinabsteigen',
        outcomes: [
          outcome('herzkammer', 35, 1.3, 3.5),
          outcome('tuerFaelltZu', 65, 0.55, 0.6, 0.2),
        ],
      },
    ],
  },
];

export const EVENT_IDS = EVENTS.map((e) => e.id);

export function getEvent(id: string): EventDef | undefined {
  return EVENTS.find((e) => e.id === id);
}
