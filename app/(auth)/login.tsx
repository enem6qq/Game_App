import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/features/auth/schema';
import { useAuth } from '@/features/auth/useAuth';
import { config } from '@/lib/config';
import { getErrorMessage } from '@/utils/errors';

/**
 * Einstieg ins Spiel.
 * Der schnellste Weg ist der GAST-MODUS (komplett lokal, kein Konto).
 * Das klassische Konto-Login bleibt für spätere Online-Funktionen
 * erhalten und wird nur angezeigt, wenn Supabase konfiguriert ist.
 */
export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, playAsGuest } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    try {
      await signIn(values.email, values.password);
      // Weiterleitung passiert automatisch über app/index.tsx.
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const onGuest = () => {
    playAsGuest();
    router.replace('/(app)/(tabs)');
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.logo}>🏝️</Text>
        <Text variant="h1">{t('common.appName')}</Text>
        <Text muted>{t('game.tagline')}</Text>
      </View>

      <Card style={styles.guestCard}>
        <Text variant="h3">{t('auth.guestTitle')}</Text>
        <Text muted>{t('auth.guestHint')}</Text>
        <Button title={t('auth.playAsGuest')} onPress={onGuest} />
      </Card>

      {config.hasSupabase ? (
        <>
          <Text muted style={styles.divider}>
            {t('auth.orWithAccount')}
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.email')}
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.password')}
                secureTextEntry
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          {serverError ? (
            <Text color="#dc2626" style={styles.serverError}>
              {serverError}
            </Text>
          ) : null}

          <Button
            title={t('auth.login')}
            variant="secondary"
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />

          <View style={styles.links}>
            <Link href="/(auth)/forgot-password">
              <Text color="#2563eb">{t('auth.forgotPassword')}</Text>
            </Link>
            <Link href="/(auth)/register">
              <Text color="#2563eb">{t('auth.noAccount')}</Text>
            </Link>
          </View>
        </>
      ) : (
        <Text muted style={styles.divider}>
          {t('auth.accountLater')}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24, gap: 4, alignItems: 'center', marginTop: 24 },
  logo: { fontSize: 56 },
  guestCard: { gap: 12 },
  divider: { textAlign: 'center', marginVertical: 20 },
  serverError: { marginBottom: 12 },
  links: { marginTop: 24, gap: 16, alignItems: 'center' },
});
