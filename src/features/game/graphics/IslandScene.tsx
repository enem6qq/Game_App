import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

import { isNight, weatherAt, type BuildingId } from '@/features/game/engine';
import { useGameStore } from '@/features/game/store';

import { celestialPosition, skyGradient } from './sky';

/**
 * Die animierte Inselszene – das Herzstück der Insel-Ansicht.
 * Alles hier ist selbst gezeichnete Vektorgrafik (keine fremden Assets):
 *  – Der Himmel färbt sich nach echter Uhrzeit (Morgen/Tag/Abend/Nacht)
 *    und echtem Spielwetter (Nebel, Sturm, Aetherregen).
 *  – Sonne bzw. Mond wandern im Tagesverlauf über den Himmel.
 *  – Wolken ziehen vorbei, die Insel schwebt sanft auf und ab.
 *  – Gebäude erscheinen in der Szene, sobald sie gebaut sind.
 */

const SCENE_W = 360;
const SCENE_H = 190;

/** Feste Sternpositionen (dezent zufällig verteilt, aber stabil). */
const STARS: { x: number; y: number; r: number }[] = [
  { x: 22, y: 18, r: 1.4 },
  { x: 58, y: 42, r: 1 },
  { x: 96, y: 14, r: 1.2 },
  { x: 132, y: 52, r: 1 },
  { x: 168, y: 22, r: 1.5 },
  { x: 205, y: 44, r: 1 },
  { x: 238, y: 12, r: 1.2 },
  { x: 268, y: 38, r: 1 },
  { x: 300, y: 20, r: 1.4 },
  { x: 330, y: 48, r: 1 },
  { x: 44, y: 66, r: 1 },
  { x: 312, y: 70, r: 1.1 },
];

/** Regentropfen-/Windlinien-Raster für Wetter-Effekte. */
const DROPS: { x: number; y: number }[] = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 61) % SCENE_W,
  y: 12 + ((i * 37) % 110),
}));

export function IslandScene() {
  const now = useGameStore((s) => s.state.lastTick);
  const buildings = useGameStore((s) => s.state.buildings);

  const weather = weatherAt(now);
  const night = isNight(now);
  const sky = skyGradient(now, weather);
  const celestial = celestialPosition(now);

  // Sanftes Schweben der Insel.
  const bob = useLoop(4600);
  const bobY = bob.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -5, 0] });

  // Drei Wolkenbahnen mit unterschiedlichem Tempo.
  const cloudSpeed = weather === 'sturmfront' ? 0.45 : 1;
  const c1 = useLoop(52_000 * cloudSpeed);
  const c2 = useLoop(74_000 * cloudSpeed);
  const c3 = useLoop(96_000 * cloudSpeed);
  const drift = (v: Animated.Value) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [-90, SCENE_W + 40] });

  const cloudColor = weather === 'sturmfront' ? '#5d6672' : night ? '#8b93ad' : '#ffffff';

  return (
    <View style={styles.frame}>
      {/* Ebene 1: Himmel, Gestirn, Fernes */}
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={sky.top} />
            <Stop offset="1" stopColor={sky.bottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="url(#sky)" />

        {night
          ? STARS.map((s, i) => (
              <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f4f0d9" opacity={0.85} />
            ))
          : null}

        {celestial.kind === 'sonne' ? (
          <G>
            <Circle
              cx={celestial.x * SCENE_W}
              cy={celestial.y * SCENE_H}
              r={26}
              fill="#ffd166"
              opacity={0.25}
            />
            <Circle
              cx={celestial.x * SCENE_W}
              cy={celestial.y * SCENE_H}
              r={15}
              fill="#ffd166"
            />
          </G>
        ) : (
          <G>
            <Circle
              cx={celestial.x * SCENE_W}
              cy={celestial.y * SCENE_H}
              r={13}
              fill="#e8ecf4"
            />
            <Circle
              cx={celestial.x * SCENE_W - 4}
              cy={celestial.y * SCENE_H - 3}
              r={3}
              fill="#c3cad9"
            />
            <Circle
              cx={celestial.x * SCENE_W + 5}
              cy={celestial.y * SCENE_H + 4}
              r={2}
              fill="#c3cad9"
            />
          </G>
        )}

        {/* Ferne Nachbarinseln als Silhouetten */}
        <G opacity={night ? 0.25 : 0.3}>
          <Path d="M30 96 Q45 88 62 96 L55 112 Q46 120 39 112 Z" fill="#2f3d52" />
          <Path d="M300 78 Q315 70 332 78 L326 92 Q317 100 308 92 Z" fill="#2f3d52" />
        </G>

        {/* Wetter-Effekte */}
        {weather === 'aetherregen'
          ? DROPS.map((d, i) => (
              <Line
                key={i}
                x1={d.x}
                y1={d.y}
                x2={d.x - 3}
                y2={d.y + 10}
                stroke="#c9a7ff"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.6}
              />
            ))
          : null}
        {weather === 'sturmfront'
          ? DROPS.slice(0, 10).map((d, i) => (
              <Line
                key={i}
                x1={d.x}
                y1={d.y + 20}
                x2={d.x + 26}
                y2={d.y + 14}
                stroke="#c8d2dd"
                strokeWidth={1.6}
                strokeLinecap="round"
                opacity={0.4}
              />
            ))
          : null}
        {weather === 'nebelbank' ? (
          <G opacity={0.5}>
            <Rect
              x={-10}
              y={92}
              width={SCENE_W + 20}
              height={16}
              rx={8}
              fill="#dfe5ec"
              opacity={0.55}
            />
            <Rect
              x={-30}
              y={116}
              width={SCENE_W + 60}
              height={20}
              rx={10}
              fill="#dfe5ec"
              opacity={0.4}
            />
          </G>
        ) : null}
      </Svg>

      {/* Ebene 2: ziehende Wolken */}
      <Animated.View
        style={[styles.cloud, { top: 18, transform: [{ translateX: drift(c1) }] }]}
      >
        <Cloud color={cloudColor} scale={1} />
      </Animated.View>
      <Animated.View
        style={[styles.cloud, { top: 54, transform: [{ translateX: drift(c2) }] }]}
      >
        <Cloud color={cloudColor} scale={0.7} />
      </Animated.View>
      <Animated.View
        style={[styles.cloud, { top: 36, transform: [{ translateX: drift(c3) }] }]}
      >
        <Cloud color={cloudColor} scale={0.5} />
      </Animated.View>

      {/* Ebene 3: die schwebende Insel */}
      <Animated.View style={[styles.island, { transform: [{ translateY: bobY }] }]}>
        <Island buildings={buildings} night={night} />
      </Animated.View>
    </View>
  );
}

/** Endlos laufender 0→1-Wert für Animationen. */
function useLoop(durationMs: number): Animated.Value {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [value, durationMs]);
  return value;
}

function Cloud({ color, scale }: { color: string; scale: number }) {
  const w = 84 * scale;
  const h = 30 * scale;
  return (
    <Svg width={w} height={h} viewBox="0 0 84 30">
      <G fill={color} opacity={0.85}>
        <Ellipse cx="24" cy="20" rx="22" ry="10" />
        <Ellipse cx="46" cy="14" rx="18" ry="11" />
        <Ellipse cx="64" cy="21" rx="17" ry="8" />
      </G>
    </Svg>
  );
}

/** Die Insel selbst inkl. gebauter Gebäude. */
function Island({
  buildings,
  night,
}: {
  buildings: Record<BuildingId, number>;
  night: boolean;
}) {
  const built = (id: BuildingId) => buildings[id] > 0;

  return (
    <Svg width={280} height={120} viewBox="0 0 280 120">
      {/* Felsuntergrund */}
      <Path
        d="M22 62 Q70 84 140 84 Q210 84 258 62 L216 96 Q176 116 140 114 Q104 116 64 96 Z"
        fill="#7a5c43"
      />
      <Path
        d="M64 88 Q100 104 140 104 Q180 104 216 88 L188 102 Q160 111 140 110 Q120 111 92 102 Z"
        fill="#5f4634"
      />
      {/* Wieseninsel-Oberfläche */}
      <Ellipse cx="140" cy="62" rx="120" ry="22" fill="#6ab04c" />
      <Ellipse cx="140" cy="59" rx="120" ry="20" fill="#7cc95c" />

      {/* ⛏️ Nebelbruch */}
      {built('nebelbruch') ? (
        <G>
          <Polygon points="34,60 46,44 58,60" fill="#8d99a6" />
          <Polygon points="46,60 56,48 66,60" fill="#6f7b88" />
          <Line
            x1="52"
            y1="42"
            x2="60"
            y2="36"
            stroke="#4d3b2a"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </G>
      ) : null}

      {/* 🪂 Gleiterwerft */}
      {built('werft') ? (
        <G>
          <Path d="M72 60 Q82 42 92 60 Z" fill="#b3653f" />
          <Path d="M72 60 Q82 46 92 60" fill="#d07a4c" />
          <Polygon points="76,40 90,36 84,44" fill="#e8b04d" />
        </G>
      ) : null}

      {/* 🌾 Windmühle */}
      {built('windmuehle') ? (
        <G>
          <Polygon points="102,60 108,34 116,34 122,60" fill="#c9a36a" />
          <Circle cx="112" cy="34" r="3" fill="#4d3b2a" />
          <Line
            x1="112"
            y1="34"
            x2="122"
            y2="24"
            stroke="#f0e3c0"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Line
            x1="112"
            y1="34"
            x2="102"
            y2="24"
            stroke="#f0e3c0"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Line
            x1="112"
            y1="34"
            x2="102"
            y2="44"
            stroke="#f0e3c0"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Line
            x1="112"
            y1="34"
            x2="122"
            y2="44"
            stroke="#f0e3c0"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </G>
      ) : null}

      {/* 🔮 Aetherkollektor (glüht nachts) */}
      {built('kollektor') ? (
        <G>
          {night ? (
            <Circle cx="134" cy="46" r="12" fill="#b48ce8" opacity={0.35} />
          ) : null}
          <Polygon points="134,34 141,48 134,58 127,48" fill="#9b6dd6" />
          <Polygon points="134,34 138,48 134,56 130,48" fill="#c9a7ff" />
        </G>
      ) : null}

      {/* 🏰 Himmelsdock (immer da – Start-Gebäude) */}
      <G>
        <Rect x="150" y="30" width="26" height="30" rx="2" fill="#cdd6de" />
        <Rect x="150" y="30" width="26" height="6" fill="#aab6c2" />
        <Rect x="148" y="26" width="6" height="8" fill="#aab6c2" />
        <Rect x="160" y="26" width="6" height="8" fill="#aab6c2" />
        <Rect x="172" y="26" width="6" height="8" fill="#aab6c2" />
        <Rect x="160" y="44" width="7" height="16" rx="3" fill="#5b4a3a" />
        <Line x1="153" y1="26" x2="153" y2="14" stroke="#8a6d55" strokeWidth={2} />
        <Polygon points="153,14 166,17 153,21" fill="#e15b5b" />
      </G>

      {/* 🏺 Himmelsspeicher */}
      {built('speicher') ? (
        <G>
          <Path d="M186 60 Q184 44 192 40 Q200 44 198 60 Z" fill="#c98d4b" />
          <Rect x="188" y="37" width="8" height="4" rx="2" fill="#8a6d55" />
        </G>
      ) : null}

      {/* 🌳 Wolkenhain */}
      {built('hain') ? (
        <G>
          <Rect x="212" y="48" width="5" height="12" fill="#6d4c33" />
          <Circle cx="214" cy="42" r="10" fill="#3f9e4d" />
          <Rect x="228" y="52" width="4" height="9" fill="#6d4c33" />
          <Circle cx="230" cy="46" r="8" fill="#57b463" />
        </G>
      ) : null}

      {/* 🗼 Wachtturm */}
      {built('wachtturm') ? (
        <G>
          <Polygon points="246,60 249,28 255,28 258,60" fill="#a98f6f" />
          <Rect x="245" y="24" width="14" height="6" rx="1" fill="#8a6d55" />
          <Circle cx="252" cy="20" r="3" fill={night ? '#ffd166' : '#e8e0cf'} />
        </G>
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: SCENE_H,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cloud: { position: 'absolute', left: 0 },
  island: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
