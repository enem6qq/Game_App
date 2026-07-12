import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { logger } from '@/lib/logger';

/**
 * Start-Bildschirm. Guter Ort für eine Übersicht/Dashboard.
 * Registriert beim Öffnen die Push-Benachrichtigungen.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { token } = useNotifications();

  useEffect(() => {
    if (token) logger.debug('Push-Token', token);
  }, [token]);

  return (
    <Screen scroll>
      <Text variant="h1">{t('tabs.home')}</Text>
      <Text muted style={styles.subtitle}>
        {user?.email}
      </Text>

      <View style={styles.grid}>
        <Card>
          <Text variant="h3">👋</Text>
          <Text muted>
            Dies ist deine Start-Vorlage. Ersetze diesen Bereich durch dein
            eigenes Dashboard.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: 24 },
  grid: { gap: 16 },
});
