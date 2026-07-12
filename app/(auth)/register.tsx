import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { registerSchema, type RegisterInput } from '@/features/auth/schema';
import { useAuth } from '@/features/auth/useAuth';
import { getErrorMessage } from '@/utils/errors';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);
    try {
      await signUp(values.email, values.password);
      Alert.alert(t('auth.register'), t('auth.resetSent'));
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="h1">{t('auth.register')}</Text>
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

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('auth.password')}
            secureTextEntry
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {serverError ? (
        <Text color="#dc2626" style={styles.serverError}>
          {serverError}
        </Text>
      ) : null}

      <Button
        title={t('auth.register')}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />

      <View style={styles.links}>
        <Link href="/(auth)/login">
          <Text color="#2563eb">{t('auth.haveAccount')}</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32 },
  serverError: { marginBottom: 12 },
  links: { marginTop: 24, alignItems: 'center' },
});
