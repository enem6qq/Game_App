import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import {
  BUILDINGS,
  MAX_BUILDING_LEVEL,
  RESOURCE_EMOJI,
  buildTimeMs,
  buildingRatePerHour,
  canAfford,
  effectiveLevel,
  formatDuration,
  formatRate,
  queueSlots,
  upgradeCost,
  type BuildingId,
} from '@/features/game/engine';
import { useGameStore } from '@/features/game/store';

import { CostRow } from './CostRow';
import { CountdownBar } from './CountdownBar';

type Props = { building: BuildingId };

/**
 * Eine Gebäudekarte: Stufe, Produktion, Ausbaukosten/-zeit und
 * Ausbau-Knopf. Zeigt laufende Ausbauten mit Fortschrittsbalken.
 */
export function BuildingCard({ building }: Props) {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const upgrade = useGameStore((s) => s.upgrade);

  const def = BUILDINGS[building];
  const level = state.buildings[building];
  const now = state.lastTick;

  const unlocked = state.buildings.himmelsdock >= def.unlockDock;
  const task = state.queue.find((q) => q.building === building);
  const targetLevel = effectiveLevel(state, building) + 1;
  const atMax = effectiveLevel(state, building) >= MAX_BUILDING_LEVEL;
  const dockCapped =
    building !== 'himmelsdock' && targetLevel > effectiveLevel(state, 'himmelsdock');
  const queueFull = state.queue.length >= queueSlots(state);

  if (!unlocked) {
    return (
      <Card style={[styles.card, styles.locked]}>
        <View style={styles.titleRow}>
          <Text variant="h3">
            {def.emoji} {t(`game.buildings.${building}.name`)}
          </Text>
          <Text variant="caption" muted>
            🔒
          </Text>
        </View>
        <Text variant="caption" muted>
          {t('game.island.needsDock', { level: def.unlockDock })}
        </Text>
      </Card>
    );
  }

  const cost = upgradeCost(building, targetLevel);
  const affordable = canAfford(state.resources, cost);

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Text variant="h3">
          {def.emoji} {t(`game.buildings.${building}.name`)}
        </Text>
        <Text variant="caption" muted>
          {t('game.island.level', { level })}
        </Text>
      </View>

      <Text variant="caption" muted>
        {t(`game.buildings.${building}.desc`)}
      </Text>

      {def.produces && level > 0 ? (
        <Text variant="caption" muted>
          {RESOURCE_EMOJI[def.produces.resource]}{' '}
          {formatRate(buildingRatePerHour(building, level))}
          {!atMax ? `  →  ${formatRate(buildingRatePerHour(building, targetLevel))}` : ''}
        </Text>
      ) : null}

      {task ? (
        <CountdownBar
          startedAt={task.startedAt}
          finishesAt={task.finishesAt}
          now={now}
          label={t('game.island.upgradingTo', { level: task.targetLevel })}
        />
      ) : atMax ? (
        <Text variant="caption" muted>
          {t('game.island.maxLevel')}
        </Text>
      ) : (
        <>
          <View style={styles.costRow}>
            <CostRow cost={cost} available={state.resources} />
            <Text variant="caption" muted>
              ⏱️ {formatDuration(buildTimeMs(state, building, targetLevel))}
            </Text>
          </View>
          <Button
            title={
              dockCapped
                ? t('game.island.needsDockUpgrade')
                : t('game.island.upgradeTo', { level: targetLevel })
            }
            variant={affordable && !dockCapped && !queueFull ? 'primary' : 'secondary'}
            disabled={!affordable || dockCapped || queueFull}
            onPress={() => upgrade(building)}
          />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  locked: { opacity: 0.6 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
