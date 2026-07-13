/**
 * Tests für Windstrom, Wetter und Tag/Nacht:
 * Determinismus, Fenster-Ausrichtung und plausible Verteilung.
 */
import {
  WEATHERS,
  WIND_RESOURCES,
  WIND_WINDOW_MS,
  environmentMultipliers,
  isNight,
  weatherAt,
  windAt,
  windForecast,
} from '@/features/game/engine';

const T0 = 1_700_000_000_000; // fester Referenzzeitpunkt

describe('Windstrom', () => {
  it('ist innerhalb eines Fensters konstant', () => {
    const windowStart = Math.floor(T0 / WIND_WINDOW_MS) * WIND_WINDOW_MS;
    const a = windAt(windowStart);
    const b = windAt(windowStart + WIND_WINDOW_MS - 1);
    expect(a).toBe(b);
  });

  it('ist deterministisch (gleiche Zeit ⇒ gleiches Ergebnis)', () => {
    expect(windAt(T0)).toBe(windAt(T0));
  });

  it('liefert immer eine gültige Ressource', () => {
    for (let i = 0; i < 200; i++) {
      expect(WIND_RESOURCES).toContain(windAt(T0 + i * WIND_WINDOW_MS));
    }
  });

  it('begünstigt über viele Fenster jede Ressource mindestens einmal', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) seen.add(windAt(T0 + i * WIND_WINDOW_MS));
    expect(seen.size).toBe(WIND_RESOURCES.length);
  });
});

describe('Wetter', () => {
  it('liefert immer eine bekannte Wetterlage', () => {
    const known = Object.keys(WEATHERS);
    for (let i = 0; i < 200; i++) {
      expect(known).toContain(weatherAt(T0 + i * 3 * 3_600_000));
    }
  });

  it('zeigt über viele Fenster alle Wetterlagen', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(weatherAt(T0 + i * 3 * 3_600_000));
    expect(seen.size).toBe(Object.keys(WEATHERS).length);
  });
});

describe('Tag/Nacht', () => {
  it('erkennt Nacht (23 Uhr) und Tag (12 Uhr) in Ortszeit', () => {
    const night = new Date(2026, 0, 15, 23, 0, 0).getTime();
    const day = new Date(2026, 0, 15, 12, 0, 0).getTime();
    expect(isNight(night)).toBe(true);
    expect(isNight(day)).toBe(false);
  });

  it('zählt 5 Uhr als Nacht und 6 Uhr als Tag', () => {
    expect(isNight(new Date(2026, 0, 15, 5, 30).getTime())).toBe(true);
    expect(isNight(new Date(2026, 0, 15, 6, 0).getTime())).toBe(false);
  });
});

describe('Windvorhersage', () => {
  it('beginnt mit dem aktuellen Fenster und ist lückenlos', () => {
    const forecast = windForecast(T0, 4);
    expect(forecast).toHaveLength(4);
    const first = forecast[0]!;
    expect(first.from).toBeLessThanOrEqual(T0);
    expect(first.to).toBeGreaterThan(T0);
    for (let i = 1; i < forecast.length; i++) {
      expect(forecast[i]!.from).toBe(forecast[i - 1]!.to);
    }
  });

  it('stimmt mit windAt überein', () => {
    for (const entry of windForecast(T0, 6)) {
      expect(entry.resource).toBe(windAt(entry.from));
    }
  });
});

describe('Umwelt-Multiplikatoren', () => {
  it('sind stets positiv und niemals extrem', () => {
    for (let i = 0; i < 100; i++) {
      const mults = environmentMultipliers(T0 + i * 37 * 60_000);
      for (const value of Object.values(mults)) {
        expect(value).toBeGreaterThan(0.5);
        expect(value).toBeLessThan(6);
      }
    }
  });
});
