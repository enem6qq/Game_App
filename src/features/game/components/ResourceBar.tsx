import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import {
  RESOURCE_EMOJI,
  RESOURCE_IDS,
  formatAmount,
  formatRate,
  ratesPerHourAt,
  storageCap,
} from '@/features/game/engine';
import { useGameStore } from '@/features/game/store';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Kompakte Ressourcen-Leiste: Bestand + aktuelle Rate pro Stunde.
 * Färbt den Bestand orange, wenn das Lager fast voll ist (>90 %).
 */
export function ResourceBar() {
  const theme = useTheme();
  const state = useGameStore((s) => s.state);

  const cap = storageCap(state);
  const rates = ratesPerHourAt(state, state.lastTick);

  return (
    <Card style={styles.card}>
      {RESOURCE_IDS.map((resource) => {
        const amount = state.resources[resource];
        const nearCap = resource !== 'aether' && amount >= cap * 0.9;
        return (
          <View key={resource} style={styles.item}>
            <Text style={styles.emoji}>{RESOURCE_EMOJI[resource]}</Text>
            <Text
              variant="body"
              color={nearCap ? theme.colors.warning : theme.colors.text}
              style={styles.amount}
            >
              {formatAmount(amount)}
            </Text>
            {rates[resource] > 0 ? (
              <Text variant="caption" muted>
                {formatRate(rates[resource])}
              </Text>
            ) : null}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  item: { alignItems: 'center', flex: 1 },
  emoji: { fontSize: 18 },
  amount: { fontWeight: '600' },
});
