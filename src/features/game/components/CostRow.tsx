import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { RESOURCE_IDS, formatAmount, type Resources } from '@/features/game/engine';
import { ResourceIcon } from '@/features/game/graphics/icons';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  cost: Resources;
  /** Aktuelle Vorräte – fehlende Posten werden rot markiert. */
  available?: Resources;
};

/** Kostenzeile mit Ressourcen-Icons, Unbezahlbares in Rot. */
export function CostRow({ cost, available }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {RESOURCE_IDS.filter((r) => cost[r] > 0).map((resource) => {
        const short = available !== undefined && available[resource] < cost[resource];
        return (
          <View key={resource} style={styles.item}>
            <ResourceIcon id={resource} size={15} />
            <Text
              variant="caption"
              color={short ? theme.colors.danger : theme.colors.textMuted}
            >
              {formatAmount(cost[resource])}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
