import React from 'react';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';

/**
 * Die Bewohner der Wolkenfeste – kleine, selbst gezeichnete
 * Chibi-Figuren im Flat-Stil (keine fremden Assets).
 */

export type VillagerVariant = 'hueter' | 'siedlerin' | 'arbeiter';

const OUTFITS: Record<VillagerVariant, { cloth: string; hair: string; accent: string }> =
  {
    // Die Hüterin/der Hüter der Insel: blauer Umhang, goldener Reif.
    hueter: { cloth: '#3f87d4', hair: '#5b4632', accent: '#ffd166' },
    // Siedlerin: grünes Gewand, rotblondes Haar.
    siedlerin: { cloth: '#3f9e4d', hair: '#b3653f', accent: '#f0e3c0' },
    // Arbeiter: braune Kluft, dunkles Haar.
    arbeiter: { cloth: '#9c6b3f', hair: '#2f2a26', accent: '#8d99a6' },
  };

/** Eine kleine Bewohner-Figur (Kopf, Gewand, Beine, Frisur). */
export function Villager({
  variant,
  size = 24,
}: {
  variant: VillagerVariant;
  size?: number;
}) {
  const o = OUTFITS[variant];
  return (
    <Svg width={size * 0.72} height={size} viewBox="0 0 20 28">
      {/* Beine */}
      <Rect x="6.5" y="22" width="2.6" height="5" rx="1.3" fill="#4a3b2f" />
      <Rect x="10.9" y="22" width="2.6" height="5" rx="1.3" fill="#4a3b2f" />
      {/* Gewand */}
      <Path d="M5 23 Q4 13 10 12 Q16 13 15 23 Z" fill={o.cloth} />
      {/* Arme */}
      <Line
        x1="5.4"
        y1="16"
        x2="3.6"
        y2="19"
        stroke={o.cloth}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Line
        x1="14.6"
        y1="16"
        x2="16.4"
        y2="19"
        stroke={o.cloth}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {/* Kopf */}
      <Circle cx="10" cy="7" r="5.2" fill="#f2c9a0" />
      {/* Frisur */}
      <Path
        d="M4.8 7 Q4.6 1.6 10 1.6 Q15.4 1.6 15.2 7 Q13 3.6 10 3.6 Q7 3.6 4.8 7 Z"
        fill={o.hair}
      />
      {/* Der Hüter trägt den goldenen Reif der Insel */}
      {variant === 'hueter' ? (
        <Rect x="5.4" y="3.2" width="9.2" height="1.6" rx="0.8" fill={o.accent} />
      ) : null}
      {/* Augen */}
      <Circle cx="8" cy="7.4" r="0.7" fill="#2f2a26" />
      <Circle cx="12" cy="7.4" r="0.7" fill="#2f2a26" />
    </Svg>
  );
}

/** Ein Gleiter im Flug: Drachenschwinge mit Pilot. */
export function GliderSprite({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 34 20">
      {/* Schwinge */}
      <Path d="M2 8 Q17 -2 32 8 Q24 5 17 6 Q10 5 2 8 Z" fill="#e8b04d" />
      <Path d="M2 8 Q10 5 17 6 L17 8 Z" fill="#d19a3a" />
      {/* Halteseile */}
      <Line x1="10" y1="7" x2="16" y2="13" stroke="#5b4a3a" strokeWidth={1} />
      <Line x1="24" y1="7" x2="18" y2="13" stroke="#5b4a3a" strokeWidth={1} />
      {/* Pilot */}
      <Circle cx="17" cy="14" r="2.2" fill="#f2c9a0" />
      <Polygon points="14.8,16 19.2,16 18.4,20 15.6,20" fill="#3f87d4" />
    </Svg>
  );
}
