import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { getErrorMessage } from '@/utils/errors';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      Alert.alert(t('auth.resetPassword'), t('auth.resetSent'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="h1">{t('auth.resetPassword')}</Text>
      </View>

      <Input
        label={t('auth.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={error ?? undefined}
      />

      <Button title={t('auth.resetPassword')} loading={loading} onPress={onSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32 },
});
