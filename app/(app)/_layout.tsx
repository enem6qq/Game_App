import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuth } from '@/features/auth/useAuth';

/**
 * Schützt den gesamten App-Bereich.
 * Wer nicht angemeldet ist, wird zum Login geschickt.
 * (Die Absicherung der DATEN passiert zusätzlich in der Datenbank via RLS –
 *  dieser Guard ist nur für die Navigation.)
 */
export default function AppLayout() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="items/[id]" options={{ headerShown: true, title: '' }} />
      <Stack.Screen
        name="items/new"
        options={{ presentation: 'modal', headerShown: true, title: '' }}
      />
    </Stack>
  );
}
