import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { useBilling } from '@/features/billing/useBilling';
import { getErrorMessage } from '@/utils/errors';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { startCheckout, loading } = useBilling();

  const onUpgrade = async () => {
    try {
      await startCheckout();
    } catch (err) {
      // In der echten App als Toast/Alert anzeigen.
      console.warn(getErrorMessage(err));
    }
  };

  return (
    <Screen scroll>
      <Text variant="h1">{t('tabs.profile')}</Text>

      <Card style={styles.card}>
        <Text variant="caption" muted>
          {t('auth.email')}
        </Text>
        <Text variant="h3">{user?.email}</Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="h3">{t('billing.title')}</Text>
        <Text muted>
          {t('billing.free')} · {t('billing.upgrade')}
        </Text>
        <Button
          title={t('billing.upgrade')}
          loading={loading}
          onPress={onUpgrade}
        />
      </Card>

      <View style={styles.spacer} />
      <Button title={t('auth.logout')} variant="danger" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, marginTop: 16 },
  spacer: { height: 24 },
});
