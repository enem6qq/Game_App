/**
 * Himmelsfarben für die Inselszene.
 * Reine Funktionen: echte Uhrzeit + Wetterlage → Farbverlauf.
 * Getrennt von der UI, damit die Logik testbar bleibt.
 */
import type { WeatherId } from '@/features/game/engine';

export type SkyPhase = 'nacht' | 'morgen' | 'tag' | 'abend';

/** Tagesphase anhand der Ortszeit (Stunde mit Minutenanteil). */
export function skyPhaseAt(ms: number): SkyPhase {
  const d = new Date(ms);
  const hour = d.getHours() + d.getMinutes() / 60;
  if (hour < 5.5 || hour >= 20) return 'nacht';
  if (hour < 8) return 'morgen';
  if (hour < 17.5) return 'tag';
  return 'abend';
}

type Gradient = { top: string; bottom: string };

const PHASE_COLORS: Record<SkyPhase, Gradient> = {
  nacht: { top: '#10142e', bottom: '#2a3158' },
  morgen: { top: '#7a6fb8', bottom: '#f5b971' },
  tag: { top: '#3f87d4', bottom: '#a8d8f0' },
  abend: { top: '#4a4e8f', bottom: '#e8875a' },
};

/** Wetter färbt den Himmel ein (0 = kein Einfluss, 1 = volle Wetterfarbe). */
const WEATHER_TINT: Partial<Record<WeatherId, { color: string; amount: number }>> = {
  nebelbank: { color: '#9aa5b1', amount: 0.45 },
  sturmfront: { color: '#37404a', amount: 0.5 },
  aetherregen: { color: '#6b4fa8', amount: 0.4 },
};

/** Zwei Hex-Farben mischen (t = Anteil der zweiten Farbe). */
export function mixColors(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const c = pa.map((v, i) => Math.round(v + ((pb[i] ?? 0) - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function parseHex(hex: string): number[] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** Der fertige Farbverlauf für Himmel zu Zeitpunkt + Wetter. */
export function skyGradient(ms: number, weather: WeatherId): Gradient {
  const base = PHASE_COLORS[skyPhaseAt(ms)];
  const tint = WEATHER_TINT[weather];
  if (!tint) return base;
  return {
    top: mixColors(base.top, tint.color, tint.amount),
    bottom: mixColors(base.bottom, tint.color, tint.amount),
  };
}

/**
 * Position von Sonne bzw. Mond (0..1 horizontal, 0..1 vertikal).
 * Wandert im Tagesverlauf in einem flachen Bogen über den Himmel.
 */
export function celestialPosition(ms: number): {
  kind: 'sonne' | 'mond';
  x: number;
  y: number;
} {
  const d = new Date(ms);
  const hour = d.getHours() + d.getMinutes() / 60;
  const night = hour < 6 || hour >= 20;

  // Fortschritt über die jeweilige Phase (Tag: 6–20 Uhr, Nacht: 20–6 Uhr).
  const progress = night
    ? ((hour + 24 - 20) % 24) / 10 // 20:00 → 0, 06:00 → 1
    : (hour - 6) / 14; // 06:00 → 0, 20:00 → 1

  const clamped = Math.min(1, Math.max(0, progress));
  return {
    kind: night ? 'mond' : 'sonne',
    x: 0.1 + clamped * 0.8,
    // Flacher Bogen: mittags/mitternachts am höchsten.
    y: 0.38 - Math.sin(clamped * Math.PI) * 0.22,
  };
}
