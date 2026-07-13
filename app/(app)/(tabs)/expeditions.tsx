import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { CostRow } from '@/features/game/components/CostRow';
import { CountdownBar } from '@/features/game/components/CountdownBar';
import { ErrorNotice } from '@/features/game/components/ErrorNotice';
import { ResourceBar } from '@/features/game/components/ResourceBar';
import {
  EXPEDITION_TIERS,
  EXPEDITION_TIER_IDS,
  GLEITER_COST,
  RESOURCE_EMOJI,
  RESOURCE_IDS,
  ZERO_RESOURCES,
  cloneResources,
  expeditionSlots,
  formatAmount,
  formatDuration,
  getEvent,
  gleiterCap,
  totalGleiter,
  type Expedition,
} from '@/features/game/engine';
import { useGameStore } from '@/features/game/store';

/**
 * Expeditionen: Gleiter ausbilden, Ziele im Wolkenmeer ansteuern und
 * nach der Rückkehr die Ereignis-Entscheidung treffen.
 */
export default function ExpeditionsScreen() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);

  const hasTower = state.buildings.wachtturm >= 1;
  const hasWerft = state.buildings.werft >= 1;

  return (
    <Screen scroll>
      <ErrorNotice />
      <Text variant="h1">🪂 {t('game.expeditions.title')}</Text>
      <Text muted style={styles.subtitle}>
        {t('game.expeditions.subtitle')}
      </Text>

      <View style={styles.stack}>
        <ResourceBar />
        <ExpeditionResultCard />

        {!hasTower ? (
          <Card style={styles.card}>
            <Text variant="h3">🗼 {t('game.expeditions.lockedTitle')}</Text>
            <Text muted>{t('game.expeditions.lockedHint')}</Text>
          </Card>
        ) : (
          <>
            <GleiterCard hasWerft={hasWerft} />
            {state.expeditions.map((expedition) => (
              <ActiveExpeditionCard key={expedition.id} expedition={expedition} />
            ))}
            <DestinationList />
          </>
        )}
      </View>
    </Screen>
  );
}

/** Gleiter-Bestand und Ausbildung. */
function GleiterCard({ hasWerft }: { hasWerft: boolean }) {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const train = useGameStore((s) => s.train);

  if (!hasWerft) {
    return (
      <Card style={styles.card}>
        <Text variant="h3">🪂 {t('game.expeditions.gleiter')}</Text>
        <Text muted>{t('game.expeditions.needsWerft')}</Text>
      </Card>
    );
  }

  const cap = gleiterCap(state);
  const total = totalGleiter(state);

  const costFor = (count: number) => {
    const cost = cloneResources(ZERO_RESOURCES);
    for (const r of RESOURCE_IDS) cost[r] = GLEITER_COST[r] * count;
    return cost;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.rowBetween}>
        <Text variant="h3">🪂 {t('game.expeditions.gleiter')}</Text>
        <Text muted>
          {state.gleiter} {t('game.expeditions.home')} · {total} / {cap}
        </Text>
      </View>
      <CostRow cost={costFor(1)} available={state.resources} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title={t('game.expeditions.train', { count: 1 })}
            variant="secondary"
            disabled={total >= cap}
            onPress={() => train(1)}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title={t('game.expeditions.train', { count: 5 })}
            variant="secondary"
            disabled={total + 5 > cap}
            onPress={() => train(5)}
          />
        </View>
      </View>
    </Card>
  );
}

/** Eine laufende Expedition: unterwegs (Countdown) oder Ereignis (Wahl). */
function ActiveExpeditionCard({ expedition }: { expedition: Expedition }) {
  const { t } = useTranslation();
  const now = useGameStore((s) => s.state.lastTick);
  const choose = useGameStore((s) => s.chooseExpeditionOption);

  const tier = EXPEDITION_TIERS[expedition.tier];

  if (expedition.status === 'unterwegs') {
    return (
      <Card style={styles.card}>
        <Text variant="h3">
          {tier.emoji} {t(`game.expeditions.tiers.${expedition.tier}.name`)}
        </Text>
        <Text variant="caption" muted>
          {t('game.expeditions.underway', { count: expedition.gleiter })}
        </Text>
        <CountdownBar
          startedAt={expedition.startedAt}
          finishesAt={expedition.finishesAt}
          now={now}
        />
      </Card>
    );
  }

  // Ereignis: Geschichte + Entscheidungen
  const event = getEvent(expedition.eventId);
  if (!event) return null;

  return (
    <Card style={styles.eventCard}>
      <Text variant="h3">
        {event.emoji} {t(`game.events.${event.id}.title`)}
      </Text>
      <Text>{t(`game.events.${event.id}.text`)}</Text>
      <View style={styles.choices}>
        {event.choices.map((choice) => (
          <Button
            key={choice.id}
            title={t(`game.events.${event.id}.choices.${choice.id}`)}
            variant="secondary"
            onPress={() => choose(expedition.id, choice.id)}
          />
        ))}
      </View>
    </Card>
  );
}

/** Ergebnis der zuletzt aufgelösten Expedition. */
function ExpeditionResultCard() {
  const { t } = useTranslation();
  const result = useGameStore((s) => s.lastExpeditionResult);
  const dismiss = useGameStore((s) => s.dismissExpeditionResult);

  if (!result) return null;

  return (
    <Card style={styles.eventCard}>
      <Text variant="h3">📯 {t('game.expeditions.resultTitle')}</Text>
      <Text>{t(`game.events.${result.eventId}.results.${result.outcomeId}`)}</Text>
      <View style={styles.rowWrap}>
        {RESOURCE_IDS.filter((r) => result.loot[r] > 0).map((resource) => (
          <Text key={resource}>
            {RESOURCE_EMOJI[resource]} +{formatAmount(result.loot[resource])}
          </Text>
        ))}
      </View>
      {result.gleiterVerloren > 0 ? (
        <Text variant="caption" muted>
          💔 {t('game.expeditions.lost', { count: result.gleiterVerloren })}
        </Text>
      ) : null}
      <Text variant="caption" muted>
        🪂 {t('game.expeditions.returned', { count: result.gleiterZurueck })}
      </Text>
      <Button title={t('game.expeditions.resultOk')} onPress={dismiss} />
    </Card>
  );
}

/** Liste der Ziele im Wolkenmeer. */
function DestinationList() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const send = useGameStore((s) => s.sendExpedition);

  const slots = expeditionSlots(state);
  const slotsFree = state.expeditions.length < slots;

  return (
    <>
      <Text variant="h2" style={styles.sectionTitle}>
        {t('game.expeditions.destinations')} ({state.expeditions.length}/{slots})
      </Text>
      {EXPEDITION_TIER_IDS.map((tierId) => {
        const tier = EXPEDITION_TIERS[tierId];
        const towerOk = state.buildings.wachtturm >= tier.minTower;
        const gleiterOk = state.gleiter >= tier.gleiter;

        return (
          <Card key={tierId} style={[styles.card, !towerOk && styles.locked]}>
            <View style={styles.rowBetween}>
              <Text variant="h3">
                {tier.emoji} {t(`game.expeditions.tiers.${tierId}.name`)}
              </Text>
              <Text variant="caption" muted>
                ⏱️ {formatDuration(tier.durationMs)}
              </Text>
            </View>
            <Text variant="caption" muted>
              {t(`game.expeditions.tiers.${tierId}.desc`)}
            </Text>
            <Text variant="caption" muted>
              🪂 ×{tier.gleiter}
              {!towerOk
                ? ` · ${t('game.expeditions.needsTower', { level: tier.minTower })}`
                : ''}
            </Text>
            {towerOk ? (
              <Button
                title={t('game.expeditions.send')}
                variant={gleiterOk && slotsFree ? 'primary' : 'secondary'}
                disabled={!gleiterOk || !slotsFree}
                onPress={() => send(tierId)}
              />
            ) : null}
          </Card>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: 16 },
  stack: { gap: 12, paddingBottom: 24 },
  card: { gap: 8 },
  eventCard: { gap: 10, borderWidth: 2 },
  locked: { opacity: 0.6 },
  choices: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: { flex: 1 },
  sectionTitle: { marginTop: 8 },
});
