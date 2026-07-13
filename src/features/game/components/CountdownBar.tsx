import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatDuration } from '@/features/game/engine';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  startedAt: number;
  finishesAt: number;
  now: number;
  label?: string;
};

/**
 * Fortschrittsbalken mit Restzeit – für Bau-Aufträge und Expeditionen.
 */
export function CountdownBar({ startedAt, finishesAt, now, label }: Props) {
  const theme = useTheme();
  const total = Math.max(1, finishesAt - startedAt);
  const progress = Math.min(1, Math.max(0, (now - startedAt) / total));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {label ? (
          <Text variant="caption" muted>
            {label}
          </Text>
        ) : (
          <View />
        )}
        <Text variant="caption" muted>
          ⏳ {formatDuration(finishesAt - now)}
        </Text>
      </View>
      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.border,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, overflow: 'hidden' },
  fill: { height: '100%' },
});
