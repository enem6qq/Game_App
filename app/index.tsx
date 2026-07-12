import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/useAuth';

/**
 * Einstiegspunkt: entscheidet, wohin der Nutzer geleitet wird.
 * - Solange die Session lädt: kleiner Ladeindikator.
 * - Angemeldet  -> Haupt-App (Tabs).
 * - Nicht angemeldet -> Login.
 */
export default function Index() {
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(app)/(tabs)' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
