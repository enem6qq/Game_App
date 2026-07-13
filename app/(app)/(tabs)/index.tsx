import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { BuildingCard } from '@/features/game/components/BuildingCard';
import { ErrorNotice } from '@/features/game/components/ErrorNotice';
import { OfflineSummaryModal } from '@/features/game/components/OfflineSummaryModal';
import { QuestCard } from '@/features/game/components/QuestCard';
import { ResourceBar } from '@/features/game/components/ResourceBar';
import { SkyBanner } from '@/features/game/components/SkyBanner';
import { BUILDING_IDS, queueSlots } from '@/features/game/engine';
import { IslandScene } from '@/features/game/graphics/IslandScene';
import { useGameStore } from '@/features/game/store';

/**
 * Herzstück des Spiels: die eigene Himmelsinsel.
 * Wetter/Wind, Ressourcen, aktuelle Aufgabe und alle Gebäude.
 */
export default function IslandScreen() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);

  const islandName = state.islandName || t('game.island.defaultName');

  return (
    <Screen scroll>
      <OfflineSummaryModal />
      <ErrorNotice />

      <Text variant="h1">{islandName}</Text>
      <Text muted style={styles.subtitle}>
        {t('game.island.queue', {
          used: state.queue.length,
          slots: queueSlots(state),
        })}
      </Text>

      <View style={styles.stack}>
        <IslandScene />
        <SkyBanner />
        <ResourceBar />
        <QuestCard />

        {BUILDING_IDS.map((id) => (
          <BuildingCard key={id} building={id} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: 16 },
  stack: { gap: 12, paddingBottom: 24 },
});
