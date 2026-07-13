import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuth } from '@/features/auth/useAuth';

/**
 * Schützt den gesamten App-Bereich.
 * Zutritt hat, wer angemeldet ist ODER im Gast-Modus spielt.
 * (Die Absicherung der DATEN passiert zusätzlich in der Datenbank via RLS –
 *  dieser Guard ist nur für die Navigation.)
 */
export default function AppLayout() {
  const { canEnter, initializing } = useAuth();

  if (initializing) return null;
  if (!canEnter) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
