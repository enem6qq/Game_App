// Supabase Edge Function (läuft auf dem Server, mit Deno).
// Erstellt eine Stripe-Zahlungs-Sitzung. Der GEHEIME Stripe-Schlüssel
// bleibt hier auf dem Server und kommt nie in die App.
//
// Deployment:
//   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
//   supabase functions deploy create-payment-sheet
//
// Hinweis: Dies ist ein Grundgerüst. Passe Preise/Produkte an dein
// Stripe-Konto an.

import Stripe from 'https://esm.sh/stripe@16?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  try {
    // Kunde anlegen (in echt: bestehenden Kunden anhand user_id wiederverwenden).
    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // 9,99 € in Cent
      currency: 'eur',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    return Response.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 400 },
    );
  }
});
