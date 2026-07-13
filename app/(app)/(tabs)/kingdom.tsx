import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { ErrorNotice } from '@/features/game/components/ErrorNotice';
import { QuestCard } from '@/features/game/components/QuestCard';
import {
  BLESSINGS,
  BLESSING_IDS,
  RESOURCE_IDS,
  formatAmount,
  questProgress,
  type ChronicleEntry,
} from '@/features/game/engine';
import { ResourceIcon } from '@/features/game/graphics/icons';
import { useGameStore } from '@/features/game/store';

/**
 * Das Reich: Aufgaben, Segen (Aether-Boni), Statistiken und die
 * Inselchronik – alles rund um den langfristigen Fortschritt.
 */
export default function KingdomScreen() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);

  return (
    <Screen scroll>
      <ErrorNotice />
      <Text variant="h1">📜 {t('game.kingdom.title')}</Text>
      <View style={styles.subtitleRow}>
        <ResourceIcon id="aether" size={16} />
        <Text muted>
          {formatAmount(state.resources.aether)} {t('game.resources.aether')}
        </Text>
      </View>

      <View style={styles.stack}>
        <QuestCard />
        <BlessingList />
        <StatsCard />
        <ChronicleCard />
      </View>
    </Screen>
  );
}

/** Segen: dauerhafte Boni gegen Aether. */
function BlessingList() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const purchase = useGameStore((s) => s.purchaseBlessing);

  return (
    <Card style={styles.card}>
      <Text variant="h3">✨ {t('game.blessings.title')}</Text>
      <Text variant="caption" muted>
        {t('game.blessings.hint')}
      </Text>
      {BLESSING_IDS.map((id) => {
        const def = BLESSINGS[id];
        const level = state.blessings[id];
        const maxed = level >= def.maxLevel;
        const cost = def.costs[level];
        const affordable = cost !== undefined && state.resources.aether >= cost;

        return (
          <View key={id} style={styles.blessingRow}>
            <View style={styles.flex}>
              <Text>
                {def.emoji} {t(`game.blessings.${id}.name`)}{' '}
                <Text variant="caption" muted>
                  {level}/{def.maxLevel}
                </Text>
              </Text>
              <Text variant="caption" muted>
                {t(`game.blessings.${id}.desc`)}
              </Text>
            </View>
            {maxed ? (
              <Text variant="caption" muted>
                ✔️
              </Text>
            ) : (
              <Button
                title={`✨ ${cost}`}
                variant={affordable ? 'primary' : 'secondary'}
                disabled={!affordable}
                onPress={() => purchase(id)}
              />
            )}
          </View>
        );
      })}
    </Card>
  );
}

/** Statistiken der Insel. */
function StatsCard() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);

  const ageDays = Math.max(1, Math.ceil((state.lastTick - state.createdAt) / 86_400_000));
  const progress = questProgress(state);

  return (
    <Card style={styles.card}>
      <Text variant="h3">📊 {t('game.stats.title')}</Text>
      <Text variant="caption" muted>
        {t('game.stats.age', { days: ageDays })} ·{' '}
        {t('game.stats.dock', { level: state.buildings.himmelsdock })} ·{' '}
        {t('game.stats.quests', {
          done: progress.done,
          total: progress.total,
        })}{' '}
        · {t('game.stats.expeditions', { count: state.expeditionsResolved })} ·{' '}
        {t('game.stats.hunts', { won: state.huntsWon, total: state.huntsResolved })}
      </Text>
      <View style={styles.rowWrap}>
        {RESOURCE_IDS.map((resource) => (
          <View key={resource} style={styles.statItem}>
            <ResourceIcon id={resource} size={14} />
            <Text variant="caption" muted>
              {t('game.stats.lifetime', {
                amount: formatAmount(state.lifetime[resource]),
              })}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

/** Die Inselchronik: was bisher geschah. */
function ChronicleCard() {
  const { t } = useTranslation();
  const chronicle = useGameStore((s) => s.state.chronicle);

  const describe = (entry: ChronicleEntry): string => {
    const p = entry.params ?? {};
    switch (entry.key) {
      case 'welcome':
        return t('game.chronicle.welcome');
      case 'buildFinished':
        return t('game.chronicle.buildFinished', {
          building: t(`game.buildings.${p.building}.name`),
          level: p.level,
        });
      case 'expeditionArrived':
        return t('game.chronicle.expeditionArrived', {
          tier: t(`game.expeditions.tiers.${p.tier}.name`),
        });
      case 'expeditionResolved':
        return t('game.chronicle.expeditionResolved', {
          tier: t(`game.expeditions.tiers.${p.tier}.name`),
        });
      case 'gleiterTrained':
        return t('game.chronicle.gleiterTrained', { count: Number(p.count ?? 0) });
      case 'huntWon':
        return t('game.chronicle.huntWon', {
          beast: t(`game.hunts.beasts.${p.beast}.name`),
        });
      case 'huntLost':
        return t('game.chronicle.huntLost', {
          beast: t(`game.hunts.beasts.${p.beast}.name`),
        });
      case 'questDone':
        return t('game.chronicle.questDone', {
          quest: t(`game.quests.${p.quest}`),
        });
      case 'blessing':
        return t('game.chronicle.blessing', {
          blessing: t(`game.blessings.${p.blessing}.name`),
          level: p.level,
        });
      default:
        return entry.key;
    }
  };

  const timeOf = (ms: number) =>
    new Date(ms).toLocaleString([], {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Card style={styles.card}>
      <Text variant="h3">📖 {t('game.chronicle.title')}</Text>
      {chronicle.slice(0, 20).map((entry, index) => (
        <View key={`${entry.at}-${index}`} style={styles.chronicleRow}>
          <Text variant="caption" muted style={styles.chronicleTime}>
            {timeOf(entry.at)}
          </Text>
          <Text variant="caption" style={styles.flex}>
            {describe(entry)}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: 16 },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 16,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stack: { gap: 12, paddingBottom: 24 },
  card: { gap: 10 },
  blessingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chronicleRow: { flexDirection: 'row', gap: 8 },
  chronicleTime: { width: 92 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flex: { flex: 1 },
});
