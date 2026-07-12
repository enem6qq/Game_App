import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from './Button';
import { Text } from './Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  /** Zeigt einen Ladeindikator. */
  loading?: boolean;
  /** Zeigt einen Fehler mit "Erneut versuchen"-Knopf. */
  error?: unknown;
  /** Meldung, wenn keine Daten vorhanden sind. */
  emptyMessage?: string;
  onRetry?: () => void;
};

/**
 * Vereinheitlicht die drei Standard-Zustände einer Liste/Seite:
 * Laden, Fehler und "keine Daten". Spart in jedem Screen dieselben if-Blöcke.
 */
export function StateView({ loading, error, emptyMessage, onRetry }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text muted style={styles.text}>
          {t('common.error')}
        </Text>
        {onRetry ? <Button title={t('common.retry')} onPress={onRetry} /> : null}
      </View>
    );
  }

  if (emptyMessage) {
    return (
      <View style={styles.center}>
        <Text muted style={styles.text}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  text: {
    textAlign: 'center',
  },
});
