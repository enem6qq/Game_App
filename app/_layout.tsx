import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n'; // i18n einmalig initialisieren
import { AuthProvider } from '@/features/auth/AuthProvider';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/theme/ThemeProvider';

/**
 * Wurzel-Layout der App.
 * Hier werden alle globalen "Provider" ineinander verschachtelt.
 * Reihenfolge = Verfügbarkeit: was weiter außen steht, ist überall nutzbar.
 *
 * Für Stripe später hier zusätzlich umschließen:
 *   <StripeProvider publishableKey={config.stripe.publishableKey}> ... </StripeProvider>
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <Slot />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
