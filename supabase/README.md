# Backend (Supabase)

Dieses Verzeichnis enthält alles, was das Backend deiner App braucht:
Datenbank-Schema, Sicherheitsregeln und Server-Funktionen.

## Warum Supabase?

Supabase ist ein „Backend zum Mieten": Datenbank (Postgres), Anmeldung,
Datei-Speicher und Server-Funktionen – fertig konfiguriert. Du sparst dir
einen eigenen Server zu bauen und zu betreiben.

## Einrichtung

1. Kostenloses Projekt auf https://supabase.com anlegen.
2. `URL` und `anon key` aus **Project Settings → API** kopieren und in deine
   `.env` eintragen (siehe `.env.example` im Projekt-Wurzelverzeichnis).
3. Schema einspielen – entweder das SQL aus `migrations/0001_init.sql` im
   **SQL Editor** des Dashboards ausführen, oder mit der Supabase-CLI:

   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref <dein-projekt-ref>
   supabase db push
   ```

## Lokal entwickeln (optional, mit Docker)

Supabase kann komplett lokal in Docker laufen – praktisch zum Testen:

```bash
supabase start   # startet Postgres, Auth, Storage lokal
supabase stop
```

## Sicherheit: Row-Level-Security (RLS)

Die eigentliche Zugriffskontrolle passiert in der Datenbank (siehe die
`create policy`-Zeilen in der Migration), **nicht** in der App. Selbst wenn
jemand die App manipuliert, kann er keine fremden Daten sehen. Das ist der
sicherste Ansatz und Standard bei Supabase.

## Server-Funktionen

`functions/create-payment-sheet` ist ein Beispiel für eine Edge Function,
die eine Stripe-Zahlung vorbereitet. Geheime Schlüssel gehören
ausschließlich hierher – nie in die App.
