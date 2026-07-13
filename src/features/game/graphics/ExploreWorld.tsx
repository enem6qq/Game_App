import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

import { Text } from '@/components/ui';
import {
  EXPLORE_WORLD_WIDTH,
  formatAmount,
  isNight,
  remainingSparks,
  weatherAt,
} from '@/features/game/engine';
import { useGameStore } from '@/features/game/store';
import { useTheme } from '@/theme/ThemeProvider';

import { GliderSprite, Villager, type VillagerVariant } from './characters';
import { skyGradient } from './sky';

/**
 * Der Erkundungsmodus: eine seitlich scrollende, begehbare Welt.
 * Halte ◀ / ▶ gedrückt, um zu laufen – die Kamera folgt dem Hüter.
 * Alle 2 Stunden erscheinen neue Aetherfunken zum Einsammeln,
 * Bewohner verraten auf Antippen Tipps zur Insel.
 */

const GROUND_HEIGHT = 120;
const WALK_SPEED = 3.4; // Punkte pro Frame (~30 fps)
const COLLECT_DISTANCE = 24;
const KEEPER_START_X = 200;

/** Feste Deko-Positionen (Bäume, Felsen, Grasbüschel). */
const TREES = [140, 380, 640, 940, 1180, 1330];
const ROCKS = [260, 760, 1080];
const NPCS: { variant: VillagerVariant; x: number }[] = [
  { variant: 'siedlerin', x: 480 },
  { variant: 'arbeiter', x: 1020 },
];

export function ExploreWorld({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const now = useGameStore((s) => s.state.lastTick);
  const aether = useGameStore((s) => s.state.resources.aether);
  const state = useGameStore((s) => s.state);
  const pickUpSpark = useGameStore((s) => s.pickUpSpark);

  const weather = weatherAt(now);
  const night = isNight(now);
  const sky = skyGradient(now, weather);
  const sparks = remainingSparks(state, now);

  // Position des Hüters (Animated für ruckelfreie Bewegung ohne Re-Render).
  const keeperX = useRef(new Animated.Value(KEEPER_START_X)).current;
  const posRef = useRef(KEEPER_START_X);
  const dirRef = useRef<0 | 1 | -1>(0);
  const sparksRef = useRef(sparks);
  sparksRef.current = sparks;

  const [facing, setFacing] = useState<1 | -1>(1);
  const [moving, setMoving] = useState(false);
  const [tip, setTip] = useState<{ npc: number; index: number } | null>(null);

  // Bewegungs-Schleife: läuft, solange ein Richtungsknopf gedrückt ist.
  useEffect(() => {
    const interval = setInterval(() => {
      const dir = dirRef.current;
      if (dir === 0) return;
      const next = Math.min(
        EXPLORE_WORLD_WIDTH - 40,
        Math.max(40, posRef.current + dir * WALK_SPEED),
      );
      posRef.current = next;
      keeperX.setValue(next);

      // Funken in Reichweite automatisch einsammeln.
      for (const spark of sparksRef.current) {
        if (Math.abs(spark.x - next) < COLLECT_DISTANCE) {
          pickUpSpark(spark.index);
        }
      }
    }, 33);
    return () => clearInterval(interval);
  }, [keeperX, pickUpSpark]);

  // Kamera: folgt dem Hüter, klemmt an den Weltgrenzen.
  const maxCam = Math.max(1, EXPLORE_WORLD_WIDTH - screenW);
  const cameraX = keeperX.interpolate({
    inputRange: [screenW / 2, EXPLORE_WORLD_WIDTH - screenW / 2],
    outputRange: [0, -maxCam],
    extrapolate: 'clamp',
  });
  const parallaxX = keeperX.interpolate({
    inputRange: [screenW / 2, EXPLORE_WORLD_WIDTH - screenW / 2],
    outputRange: [0, -maxCam * 0.35],
    extrapolate: 'clamp',
  });

  const groundTop = screenH - GROUND_HEIGHT;

  const startWalk = (dir: 1 | -1) => {
    dirRef.current = dir;
    setFacing(dir);
    setMoving(true);
  };
  const stopWalk = () => {
    dirRef.current = 0;
    setMoving(false);
  };

  return (
    <View style={styles.root}>
      {/* Himmel */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="exploreSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={sky.top} />
            <Stop offset="1" stopColor={sky.bottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#exploreSky)" />
      </Svg>

      {/* Ferne Inseln (Parallaxe) */}
      <Animated.View
        style={[
          styles.layer,
          { top: groundTop - 150, transform: [{ translateX: parallaxX }] },
        ]}
      >
        <Svg
          width={EXPLORE_WORLD_WIDTH}
          height={150}
          viewBox={`0 0 ${EXPLORE_WORLD_WIDTH} 150`}
        >
          <G opacity={night ? 0.25 : 0.35}>
            {[120, 420, 760, 1120].map((x) => (
              <Path
                key={x}
                d={`M${x} 90 Q${x + 30} 70 ${x + 60} 90 L${x + 48} 120 Q${x + 30} 132 ${x + 12} 120 Z`}
                fill="#2f3d52"
              />
            ))}
          </G>
        </Svg>
      </Animated.View>

      {/* Die begehbare Welt */}
      <Animated.View
        style={[styles.layer, { top: 0, transform: [{ translateX: cameraX }] }]}
      >
        {/* Boden mit Deko */}
        <Svg
          width={EXPLORE_WORLD_WIDTH}
          height={GROUND_HEIGHT + 80}
          viewBox={`0 0 ${EXPLORE_WORLD_WIDTH} ${GROUND_HEIGHT + 80}`}
          style={{ position: 'absolute', top: groundTop - 80 }}
        >
          {/* Wiese */}
          <Rect
            x="0"
            y="80"
            width={EXPLORE_WORLD_WIDTH}
            height={GROUND_HEIGHT}
            fill="#6ab04c"
          />
          <Rect x="0" y="80" width={EXPLORE_WORLD_WIDTH} height={10} fill="#7cc95c" />
          {/* Felskante unten */}
          <Rect
            x="0"
            y={80 + 60}
            width={EXPLORE_WORLD_WIDTH}
            height={GROUND_HEIGHT - 60}
            fill="#7a5c43"
          />
          {/* Bäume */}
          {TREES.map((x) => (
            <G key={x}>
              <Rect x={x - 3} y={44} width={6} height={38} fill="#6d4c33" />
              <Circle cx={x} cy={36} r={20} fill="#3f9e4d" />
              <Circle cx={x - 13} cy={44} r={12} fill="#57b463" />
              <Circle cx={x + 13} cy={44} r={12} fill="#57b463" />
            </G>
          ))}
          {/* Felsen */}
          {ROCKS.map((x) => (
            <G key={x}>
              <Polygon points={`${x - 16},80 ${x - 4},58 ${x + 14},80`} fill="#8d99a6" />
              <Polygon
                points={`${x - 4},58 ${x + 4},64 ${x + 14},80 ${x + 2},80`}
                fill="#6f7b88"
              />
            </G>
          ))}
          {/* Grasbüschel */}
          {Array.from({ length: 24 }, (_, i) => 30 + i * 58).map((x) => (
            <Ellipse key={x} cx={x} cy={82} rx={7} ry={3} fill="#57b463" />
          ))}
        </Svg>

        {/* Aetherfunken */}
        {sparks.map((spark) => (
          <SparkGlow
            key={spark.index}
            x={spark.x}
            y={groundTop - 26}
            amount={spark.amount}
          />
        ))}

        {/* Bewohner mit Tipps */}
        {NPCS.map((npc, npcIndex) => (
          <View
            key={npc.variant}
            style={[styles.npc, { left: npc.x - 9, top: groundTop - 27 }]}
          >
            {tip?.npc === npcIndex ? (
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text variant="caption">
                  {t(`game.explore.tips.${(tip.index % 4) + 1}`)}
                </Text>
              </View>
            ) : null}
            <Pressable
              onPress={() =>
                setTip((old) => ({ npc: npcIndex, index: (old?.index ?? 0) + 1 }))
              }
            >
              <Villager variant={npc.variant} size={26} />
            </Pressable>
          </View>
        ))}

        {/* Der Hüter */}
        <KeeperFigure x={keeperX} facing={facing} moving={moving} top={groundTop - 28} />
      </Animated.View>

      {/* HUD */}
      <View style={styles.hud}>
        <Pressable
          onPress={onClose}
          style={[
            styles.hudButton,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text>← {t('game.explore.back')}</Text>
        </Pressable>
        <View
          style={[
            styles.hudButton,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text>✨ {formatAmount(aether)}</Text>
        </View>
      </View>
      <Text variant="caption" muted style={styles.hint}>
        {t('game.explore.hint', { count: sparks.length })}
      </Text>

      {/* Steuerung */}
      <View style={styles.controls}>
        <WalkButton label="◀" onIn={() => startWalk(-1)} onOut={stopWalk} />
        <WalkButton label="▶" onIn={() => startWalk(1)} onOut={stopWalk} />
      </View>
    </View>
  );
}

/** Der laufende Hüter mit Schritt-Hüpfer und Blickrichtung. */
function KeeperFigure({
  x,
  facing,
  moving,
  top,
}: {
  x: Animated.Value;
  facing: 1 | -1;
  moving: boolean;
  top: number;
}) {
  const hop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!moving) {
      hop.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hop, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(hop, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [moving, hop]);

  const stepY = hop.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left: -9,
        transform: [{ translateX: x }, { translateY: stepY }, { scaleX: facing }],
      }}
    >
      <Villager variant="hueter" size={28} />
    </Animated.View>
  );
}

/** Ein pulsierender Aetherfunke. */
function SparkGlow({ x, y, amount }: { x: number; y: number; amount: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });

  return (
    <Animated.View
      style={{ position: 'absolute', left: x - 10, top: y, transform: [{ scale }] }}
    >
      <Svg width={20} height={26} viewBox="0 0 20 26">
        <Polygon points="10,1 13,8 20,10 13,12 10,19 7,12 0,10 7,8" fill="#c9a7ff" />
        <Polygon
          points="10,4 12,8.6 17,10 12,11.4 10,16 8,11.4 3,10 8,8.6"
          fill="#9b6dd6"
        />
      </Svg>
      <Text variant="caption" style={styles.sparkAmount}>
        +{amount}
      </Text>
    </Animated.View>
  );
}

function WalkButton({
  label,
  onIn,
  onOut,
}: {
  label: string;
  onIn: () => void;
  onOut: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPressIn={onIn}
      onPressOut={onOut}
      style={({ pressed }) => [
        styles.walkButton,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.7 : 0.92,
        },
      ]}
    >
      <Text variant="h2">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#10142e' },
  layer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  npc: { position: 'absolute', alignItems: 'center' },
  bubble: {
    position: 'absolute',
    bottom: 34,
    width: 170,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
  },
  hud: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  hint: { position: 'absolute', top: 100, alignSelf: 'center' },
  controls: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walkButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkAmount: { textAlign: 'center', color: '#c9a7ff', fontWeight: '700' },
});
