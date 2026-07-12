import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuth } from '@/features/auth/useAuth';

/**
 * Layout für den Anmeldebereich.
 * Wer bereits angemeldet ist, wird direkt in die App geschickt.
 */
export default function AuthLayout() {
  const { isAuthenticated, initializing } = useAuth();

  if (!initializing && isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
