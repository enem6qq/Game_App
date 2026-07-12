# Checkliste: Neue App aus dieser Vorlage erstellen

So machst du aus dieser Vorlage in ~15 Minuten eine eigene App.

## 1. Vorlage kopieren

```bash
# Variante A: Als GitHub-Template markieren und "Use this template" klicken.
# Variante B: manuell klonen und Git zurücksetzen
git clone <diese-repo-url> meine-neue-app
cd meine-neue-app
rm -rf .git && git init
```

## 2. App benennen

- [ ] `app.config.ts`: `name`, `slug`, `scheme`, `bundleIdentifier`, `package`
- [ ] `package.json`: `name`
- [ ] `assets/`: Icon & Splash durch eigene ersetzen
- [ ] `src/i18n/locales/*.json`: `common.appName` anpassen

## 3. Backend anlegen

- [ ] Supabase-Projekt erstellen (siehe `supabase/README.md`)
- [ ] `.env` aus `.env.example` erstellen und Werte eintragen
- [ ] Migration `supabase/migrations/0001_init.sql` einspielen

## 4. Starten

```bash
npm install
npm start
```

Dann in der Expo-App (iOS/Android) den QR-Code scannen.

## 5. Eigenes Feature bauen

Kopiere den Ordner `src/features/items/` als Blaupause:

- [ ] `api.ts` – Datenzugriff (Supabase-Abfragen)
- [ ] `hooks.ts` – React-Hooks (TanStack Query)
- [ ] `schema.ts` – Validierung (Zod)
- [ ] neuen Bildschirm unter `app/(app)/(tabs)/` anlegen
- [ ] passende Tabelle + RLS-Policies als neue Migration ergänzen

## 6. Optional: Zahlungen aktivieren

- [ ] Stripe-Konto anlegen, `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`
- [ ] `STRIPE_SECRET_KEY` als Supabase-Secret setzen
- [ ] Edge Function deployen (siehe `supabase/functions/`)
- [ ] `<StripeProvider>` in `app/_layout.tsx` aktivieren
