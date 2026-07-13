# Architektur der Vorlage

Diese Vorlage folgt einer **feature-orientierten Struktur**: zusammengehörige
Dinge liegen beieinander, statt nach Dateityp verstreut zu sein. Das macht es
leicht, ein Feature zu finden, zu ändern oder ganz zu entfernen.

## Übersicht

```
app/                → Bildschirme & Navigation (Expo Router, dateibasiert)
  (auth)/           → Anmeldebereich (Login, Registrierung, Passwort)
  (app)/            → Geschützter Bereich (nur angemeldet)
    (tabs)/         → Untere Tab-Leiste (Start, Einträge, Profil, Einstellungen)
    items/          → Detail- & Anlege-Bildschirme

src/
  components/ui/    → Wiederverwendbare Bausteine (Button, Input, Card, …)
  features/         → Fachliche Module, je Feature gebündelt
    auth/           → Anmeldung: Provider, Hook, Validierung
    items/          → Beispiel-CRUD: API, Hooks, Formular, Validierung
    billing/        → Zahlungen (Stripe)
  hooks/            → Allgemeine Hooks (z. B. Benachrichtigungen)
  lib/              → Technische Grundlagen (Supabase, Config, Query-Client)
  store/            → Globaler Zustand (Zustand): Auth, Einstellungen
  theme/            → Design-System (Farben, Abstände, Hell/Dunkel)
  i18n/             → Mehrsprachigkeit (de/en)
  types/            → TypeScript-Typen (u. a. Datenbank)
  utils/            → Kleine Helfer

supabase/           → Backend: Datenbank-Schema, Sicherheit, Server-Funktionen
```

## Die wichtigsten Bausteine (und ihre Rollen)

| Baustein                  | Aufgabe                                                 |
| ------------------------- | ------------------------------------------------------- |
| **Expo Router**           | Navigation über die Ordnerstruktur                      |
| **Supabase**              | Anmeldung, Datenbank, Datei-Speicher, Server-Funktionen |
| **TanStack Query**        | Server-Daten laden & zwischenspeichern                  |
| **Zustand**               | Globaler App-Zustand (Session, Einstellungen)           |
| **React Hook Form + Zod** | Formulare + Validierung                                 |
| **i18next**               | Mehrsprachigkeit                                        |
| **Theme-System**          | Einheitliches Aussehen, Hell-/Dunkelmodus               |

## Datenfluss am Beispiel „Einträge"

1. Der Bildschirm `app/(app)/(tabs)/items.tsx` ruft den Hook `useItems()` auf.
2. `useItems` (in `features/items/hooks.ts`) nutzt TanStack Query und ruft
   `fetchItems()` aus `features/items/api.ts`.
3. `api.ts` spricht über den **Supabase-Client** mit der Datenbank.
4. Die Datenbank gibt dank **Row-Level-Security** nur die Einträge des
   angemeldeten Nutzers zurück.

## Sicherheit in zwei Schichten

- **Navigation:** Der Guard in `app/(app)/_layout.tsx` hält nicht angemeldete
  Nutzer aus dem App-Bereich fern.
- **Daten:** Die Datenbank selbst (RLS-Policies in der Migration) erlaubt jedem
  Nutzer ausschließlich Zugriff auf seine eigenen Daten. **Das ist die echte
  Absicherung** – der Navigations-Guard ist nur Komfort.
