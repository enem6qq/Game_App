import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { BuildingId, ResourceId } from '@/features/game/engine';

/**
 * Eigene, handgezeichnete Vektor-Icons (keine fremden Assets).
 * Flacher Stil mit festen Farben, der in Hell- und Dunkelmodus
 * gleichermaßen funktioniert.
 */

type IconProps = { size?: number };

// ---------------------------------------------------------------------------
// Ressourcen
// ---------------------------------------------------------------------------

export function ResourceIcon({ id, size = 20 }: IconProps & { id: ResourceId }) {
  switch (id) {
    case 'korn':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line
            x1="12"
            y1="22"
            x2="12"
            y2="8"
            stroke="#c99b3f"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Ellipse cx="12" cy="6" rx="2.4" ry="3.6" fill="#e8b04d" />
          <Ellipse
            cx="7.5"
            cy="10"
            rx="2.2"
            ry="3.2"
            fill="#e8b04d"
            transform="rotate(-35 7.5 10)"
          />
          <Ellipse
            cx="16.5"
            cy="10"
            rx="2.2"
            ry="3.2"
            fill="#e8b04d"
            transform="rotate(35 16.5 10)"
          />
          <Ellipse
            cx="8.5"
            cy="15"
            rx="2"
            ry="3"
            fill="#d9a041"
            transform="rotate(-35 8.5 15)"
          />
          <Ellipse
            cx="15.5"
            cy="15"
            rx="2"
            ry="3"
            fill="#d9a041"
            transform="rotate(35 15.5 15)"
          />
        </Svg>
      );
    case 'holz':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="8" width="16" height="8" rx="4" fill="#9c6b3f" />
          <Ellipse cx="19" cy="12" rx="3" ry="4" fill="#d8b088" />
          <Ellipse cx="19" cy="12" rx="1.4" ry="2" fill="#b98c5e" />
          <Line
            x1="6"
            y1="10"
            x2="12"
            y2="10"
            stroke="#7c522e"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <Line
            x1="5"
            y1="13.5"
            x2="10"
            y2="13.5"
            stroke="#7c522e"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'stein':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="4,16 7,7 15,5 20,11 18,18 8,19" fill="#8d99a6" />
          <Polygon points="7,7 15,5 14,11 8,13" fill="#aeb9c5" />
          <Polygon points="14,11 20,11 18,18 12,17" fill="#6f7b88" />
        </Svg>
      );
    case 'aether':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="#9b6dd6" />
          <Polygon
            points="12,6 13.8,10.2 18,12 13.8,13.8 12,18 10.2,13.8 6,12 10.2,10.2"
            fill="#c9a7ff"
          />
        </Svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Gebäude
// ---------------------------------------------------------------------------

export function BuildingIcon({ id, size = 30 }: IconProps & { id: BuildingId }) {
  switch (id) {
    case 'himmelsdock':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect x="6" y="10" width="16" height="14" rx="1.5" fill="#cdd6de" />
          <Rect x="5" y="7" width="4" height="5" fill="#aab6c2" />
          <Rect x="12" y="7" width="4" height="5" fill="#aab6c2" />
          <Rect x="19" y="7" width="4" height="5" fill="#aab6c2" />
          <Rect x="12" y="17" width="4.5" height="7" rx="2" fill="#5b4a3a" />
          <Line x1="7" y1="7" x2="7" y2="2" stroke="#8a6d55" strokeWidth={1.6} />
          <Polygon points="7,2 13,3.5 7,5" fill="#e15b5b" />
        </Svg>
      );
    case 'windmuehle':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Polygon points="10,26 12,10 16,10 18,26" fill="#c9a36a" />
          <Circle cx="14" cy="10" r="2" fill="#4d3b2a" />
          <Line
            x1="14"
            y1="10"
            x2="22"
            y2="3"
            stroke="#f0e3c0"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Line
            x1="14"
            y1="10"
            x2="6"
            y2="3"
            stroke="#f0e3c0"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Line
            x1="14"
            y1="10"
            x2="6"
            y2="17"
            stroke="#f0e3c0"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Line
            x1="14"
            y1="10"
            x2="22"
            y2="17"
            stroke="#f0e3c0"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'hain':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect x="12.5" y="16" width="3" height="10" fill="#6d4c33" />
          <Circle cx="14" cy="11" r="8" fill="#3f9e4d" />
          <Circle cx="9" cy="14" r="5" fill="#57b463" />
          <Circle cx="19" cy="14" r="5" fill="#57b463" />
        </Svg>
      );
    case 'nebelbruch':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Polygon points="3,24 9,12 15,24" fill="#8d99a6" />
          <Polygon points="11,24 17,10 24,24" fill="#6f7b88" />
          <Line
            x1="18"
            y1="8"
            x2="24"
            y2="4"
            stroke="#4d3b2a"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d="M16 10 Q20 4 26 6"
            stroke="#9aa5b1"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'speicher':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Path d="M9 25 Q6 12 14 8 Q22 12 19 25 Z" fill="#c98d4b" />
          <Rect x="11" y="5" width="6" height="4" rx="2" fill="#8a6d55" />
          <Path d="M10 14 Q14 16 18 14" stroke="#a06e35" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    case 'wachtturm':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Polygon points="10,26 12,8 16,8 18,26" fill="#a98f6f" />
          <Rect x="8" y="5" width="12" height="4" rx="1" fill="#8a6d55" />
          <Circle cx="14" cy="3" r="2.2" fill="#ffd166" />
        </Svg>
      );
    case 'werft':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Path d="M4 24 Q14 6 24 24 Z" fill="#b3653f" />
          <Path d="M4 24 Q14 10 24 24" fill="#d07a4c" />
          <Polygon points="9,8 23,4 16,12" fill="#e8b04d" />
        </Svg>
      );
    case 'kollektor':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Circle cx="14" cy="14" r="11" fill="#9b6dd6" opacity={0.25} />
          <Polygon points="14,3 20,14 14,25 8,14" fill="#9b6dd6" />
          <Polygon points="14,3 17,14 14,23 11,14" fill="#c9a7ff" />
        </Svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Tab-Leiste (einfarbig, Farbe kommt vom Tab-Zustand)
// ---------------------------------------------------------------------------

export type TabGlyphName = 'insel' | 'expedition' | 'reich' | 'profil' | 'einstellungen';

export function TabGlyph({
  name,
  color,
  size = 24,
}: IconProps & { name: TabGlyphName; color: string }) {
  switch (name) {
    case 'insel':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Ellipse cx="12" cy="12" rx="9" ry="4" fill={color} />
          <Path d="M6 15 Q12 22 18 15 Q15 18 12 18 Q9 18 6 15 Z" fill={color} />
          <Rect x="11" y="4" width="2" height="6" rx="1" fill={color} />
          <Path d="M12 4 Q16 2 18 5 Q14 5 12 6 Z" fill={color} />
          <Path d="M12 4 Q8 2 6 5 Q10 5 12 6 Z" fill={color} />
        </Svg>
      );
    case 'expedition':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 8 Q12 1 21 8 Q17 6 12 6 Q7 6 3 8 Z" fill={color} />
          <Line x1="5" y1="8" x2="11" y2="16" stroke={color} strokeWidth={1.6} />
          <Line x1="19" y1="8" x2="13" y2="16" stroke={color} strokeWidth={1.6} />
          <Circle cx="12" cy="18" r="2.6" fill={color} />
        </Svg>
      );
    case 'reich':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="6" y="4" width="12" height="16" rx="2" fill={color} />
          <Circle cx="6" cy="6" r="2" fill={color} />
          <Circle cx="18" cy="18" r="2" fill={color} />
          <Line x1="9" y1="9" x2="15" y2="9" stroke="#00000055" strokeWidth={1.4} />
          <Line x1="9" y1="12.5" x2="15" y2="12.5" stroke="#00000055" strokeWidth={1.4} />
          <Line x1="9" y1="16" x2="13" y2="16" stroke="#00000055" strokeWidth={1.4} />
        </Svg>
      );
    case 'profil':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="8" r="4.4" fill={color} />
          <Path d="M4 21 Q4 14 12 14 Q20 14 20 21 Z" fill={color} />
        </Svg>
      );
    case 'einstellungen':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line
            x1="4"
            y1="7"
            x2="20"
            y2="7"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Circle cx="9" cy="7" r="2.6" fill={color} />
          <Line
            x1="4"
            y1="13"
            x2="20"
            y2="13"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Circle cx="15" cy="13" r="2.6" fill={color} />
          <Line
            x1="4"
            y1="19"
            x2="20"
            y2="19"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Circle cx="7" cy="19" r="2.6" fill={color} />
        </Svg>
      );
  }
}
