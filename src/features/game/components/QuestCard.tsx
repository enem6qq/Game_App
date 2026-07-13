import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import {
  RESOURCE_EMOJI,
  RESOURCE_IDS,
  ZERO_RESOURCES,
  cloneResources,
  currentQuest,
  formatAmount,
  questClaimable,
  questProgress,
} from '@/features/game/engine';
import { useGameStore } from '@/features/game/store';

/**
 * Die aktuelle Aufgabe der geführten Quest-Kette,
 * mit Fortschritt, Belohnung und Abholen-Knopf.
 */
export function QuestCard() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const claim = useGameStore((s) => s.claimQuestReward);

  const quest = currentQuest(state);
  const progress = questProgress(state);

  if (!quest) {
    return (
      <Card style={styles.card}>
        <Text variant="h3">📜 {t('game.quests.title')}</Text>
        <Text muted>{t('game.quests.allDone')}</Text>
      </Card>
    );
  }

  const reward = cloneResources(ZERO_RESOURCES);
  for (const [resource, amount] of Object.entries(quest.reward)) {
    reward[resource as keyof typeof reward] = amount;
  }
  const claimable = questClaimable(state);

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Text variant="h3">📜 {t('game.quests.title')}</Text>
        <Text variant="caption" muted>
          {progress.done + 1} / {progress.total}
        </Text>
      </View>

      <Text>{t(`game.quests.${quest.id}`)}</Text>

      <View style={styles.rewardRow}>
        <Text variant="caption" muted>
          {t('game.quests.reward')}:
        </Text>
        {RESOURCE_IDS.filter((r) => reward[r] > 0).map((resource) => (
          <Text key={resource} variant="caption" muted>
            {RESOURCE_EMOJI[resource]} {formatAmount(reward[resource])}
          </Text>
        ))}
      </View>

      <Button
        title={claimable ? t('game.quests.claim') : t('game.quests.open')}
        variant={claimable ? 'primary' : 'secondary'}
        disabled={!claimable}
        onPress={claim}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
});
