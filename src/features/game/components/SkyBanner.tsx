import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import {
  WEATHERS,
  WIND_BONUS,
  isNight,
  weatherAt,
  windAt,
  windForecast,
} from '@/features/game/engine';
import { ResourceIcon } from '@/features/game/graphics/icons';
import { useGameStore } from '@/features/game/store';

/**
 * Der Himmel über der Insel: aktuelles Wetter, Windstrom (+ Bonus)
 * und die Windvorhersage der nächsten Fenster – das strategische
 * Herzstück fürs Planen von Ausbauten.
 */
export function SkyBanner() {
  const { t } = useTranslation();
  const now = useGameStore((s) => s.state.lastTick);

  const weather = weatherAt(now);
  const wind = windAt(now);
  const night = isNight(now);
  const forecast = windForecast(now, 4).slice(1); // die nächsten 3 Fenster

  const timeOf = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text variant="h3">
          {WEATHERS[weather].emoji} {t(`game.sky.weather.${weather}`)}
        </Text>
        {night ? <Text variant="h3">🌙</Text> : null}
      </View>

      <View style={styles.windRow}>
        <Text muted>
          {t('game.sky.wind', {
            resource: t(`game.resources.${wind}`),
            bonus: Math.round((WIND_BONUS - 1) * 100),
          })}
        </Text>
        <ResourceIcon id={wind} size={16} />
      </View>

      <View style={styles.forecastRow}>
        <Text variant="caption" muted>
          {t('game.sky.forecast')}:
        </Text>
        {forecast.map((entry) => (
          <View key={entry.from} style={styles.forecastItem}>
            <Text variant="caption" muted>
              {timeOf(entry.from)}
            </Text>
            <ResourceIcon id={entry.resource} size={13} />
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  windRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  forecastRow: { flexDirection: 'row', gap: 12, marginTop: 2, alignItems: 'center' },
  forecastItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
