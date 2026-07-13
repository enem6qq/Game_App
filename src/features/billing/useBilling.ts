import { useCallback, useState } from 'react';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

/**
 * Zahlungen mit Stripe.
 *
 * WICHTIG zum Sicherheitsmodell:
 * Der geheime Stripe-Schlüssel darf NIEMALS in die App. Die App fragt nur
 * eine "Payment Sheet"-Sitzung bei einer Server-Funktion an (hier: eine
 * Supabase Edge Function namens "create-payment-sheet") und öffnet dann das
 * native Stripe-Bezahlfenster.
 *
 * Voraussetzung: @stripe/stripe-react-native ist eingebunden und die App ist
 * mit <StripeProvider> umschlossen (siehe app/_layout.tsx, dort auskommentiert,
 * bis du echte Stripe-Schlüssel hinterlegst).
 */
export function useBilling() {
  const [loading, setLoading] = useState(false);

  const startCheckout = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Zahlungs-Sitzung serverseitig erstellen lassen.
      const { data, error } = await supabase.functions.invoke('create-payment-sheet', {
        body: { plan: 'pro' },
      });
      if (error) throw error;

      // 2) Mit data.paymentIntent / data.customer das Stripe Payment Sheet
      //    initialisieren und öffnen. Beispiel (aktivieren, sobald Stripe steht):
      //
      //    const { initPaymentSheet, presentPaymentSheet } = useStripe();
      //    await initPaymentSheet({
      //      merchantDisplayName: 'App Vorlage',
      //      customerId: data.customer,
      //      paymentIntentClientSecret: data.paymentIntent,
      //    });
      //    const result = await presentPaymentSheet();
      //    if (result.error) throw result.error;

      logger.info('Checkout gestartet', data);
      return data;
    } catch (err) {
      logger.error('Checkout fehlgeschlagen', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, startCheckout };
}
