import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/features/auth/schema';
import { useAuth } from '@/features/auth/useAuth';
import { getErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
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

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="h1">{t('auth.welcomeBack')}</Text>
        <Text muted>{t('common.appName')}</Text>
      </View>

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32, gap: 4 },
  serverError: { marginBottom: 12 },
  links: { marginTop: 24, gap: 16, alignItems: 'center' },
});
