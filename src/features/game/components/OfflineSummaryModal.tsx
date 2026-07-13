import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { RESOURCE_IDS, formatAmount, formatDuration } from '@/features/game/engine';
import { ResourceIcon } from '@/features/game/graphics/icons';
import { useGameStore } from '@/features/game/store';

/**
 * „Willkommen zurück"-Übersicht nach längerer Abwesenheit:
 * was produziert wurde, welche Bauten fertig sind und ob
 * Expeditionen zurückgekehrt sind.
 */
export function OfflineSummaryModal() {
  const { t } = useTranslation();
  const summary = useGameStore((s) => s.offlineSummary);
  const dismiss = useGameStore((s) => s.dismissOfflineSummary);

  if (!summary) return null;

  const gains = RESOURCE_IDS.filter((r) => Math.floor(summary.gained[r]) > 0);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <Card style={styles.card}>
          <Text variant="h2">🌅 {t('game.offline.title')}</Text>
          <Text muted>
            {t('game.offline.away', {
              duration: formatDuration(summary.elapsedMs),
            })}
          </Text>

          {gains.length > 0 ? (
            <View style={styles.gains}>
              {gains.map((resource) => (
                <View key={resource} style={styles.gainItem}>
                  <ResourceIcon id={resource} size={17} />
                  <Text>+{formatAmount(summary.gained[resource])}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {summary.buildsFinished > 0 ? (
            <Text>🏗️ {t('game.offline.builds', { count: summary.buildsFinished })}</Text>
          ) : null}
          {summary.expeditionsArrived > 0 ? (
            <Text>
              🪂{' '}
              {t('game.offline.expeditions', {
                count: summary.expeditionsArrived,
              })}
            </Text>
          ) : null}

          <Button title={t('game.offline.continue')} onPress={dismiss} />
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: { gap: 12 },
  gains: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gainItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
