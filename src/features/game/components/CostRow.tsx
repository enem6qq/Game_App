import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import {
  RESOURCE_EMOJI,
  RESOURCE_IDS,
  formatAmount,
  type Resources,
} from '@/features/game/engine';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  cost: Resources;
  /** Aktuelle Vorräte – fehlende Posten werden rot markiert. */
  available?: Resources;
};

/** Kostenzeile: „🌾 50  🪵 120", Unbezahlbares in Rot. */
export function CostRow({ cost, available }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {RESOURCE_IDS.filter((r) => cost[r] > 0).map((resource) => {
        const short = available !== undefined && available[resource] < cost[resource];
        return (
          <Text
            key={resource}
            variant="caption"
            color={short ? theme.colors.danger : theme.colors.textMuted}
          >
            {RESOURCE_EMOJI[resource]} {formatAmount(cost[resource])}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
});
