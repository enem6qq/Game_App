import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useGameStore } from '@/features/game/store';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Kurzer Hinweis, wenn eine Aktion nicht möglich war
 * (z. B. „Nicht genug Ressourcen"). Verschwindet nach 3 Sekunden.
 */
export function ErrorNotice() {
  const { t } = useTranslation();
  const theme = useTheme();
  const error = useGameStore((s) => s.lastError);
  const dismiss = useGameStore((s) => s.dismissError);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, [error, dismiss]);

  if (!error) return null;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.colors.danger, borderRadius: theme.radius.md },
      ]}
    >
      <Text color={theme.colors.primaryText}>{t(`game.errors.${error}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 10, marginBottom: 12 },
});
