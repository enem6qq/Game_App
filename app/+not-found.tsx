import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';

/** Fällt an, wenn eine unbekannte Route aufgerufen wird (404). */
export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nicht gefunden' }} />
      <View style={styles.container}>
        <Text variant="h2">Diese Seite existiert nicht.</Text>
        <Link href="/">
          <Text color="#2563eb">Zur Startseite</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
});
