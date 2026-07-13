/**
 * Anzeige-Helfer für Zahlen und Zeitspannen.
 * Bewusst ohne Locale-Abhängigkeit, damit Engine-Tests stabil sind.
 */

/** 1234 → „1,2k", 1234567 → „1,2M"; Nachkommastellen nur wenn nötig. */
export function formatAmount(value: number): string {
  const v = Math.floor(value);
  if (v >= 1_000_000) return trimZero(v / 1_000_000) + 'M';
  if (v >= 10_000) return trimZero(v / 1_000) + 'k';
  return String(v);
}

function trimZero(value: number): string {
  const rounded = Math.floor(value * 10) / 10;
  return String(rounded).replace('.', ',');
}

/** 90061000 ms → „1 d 1 h", 3723000 → „1 h 2 min", 62000 → „1:02". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Produktionsrate: „+120/h", gerundet auf ganze Zahlen ab 10. */
export function formatRate(perHour: number): string {
  const rounded = perHour >= 10 ? Math.round(perHour) : Math.round(perHour * 10) / 10;
  return `+${String(rounded).replace('.', ',')}/h`;
}
