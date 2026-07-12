# 📱 App-Vorlage

Eine wiederverwendbare, **voll ausgestattete** Vorlage für mobile Apps.
Einmal aufgesetzt, sparst du bei jeder neuen App die immer gleiche
Grundarbeit: Anmeldung, Datenbank, Navigation, Design, Tests und mehr sind
schon da. Du fängst direkt mit deiner eigentlichen Idee an.

> Gebaut mit **Expo (React Native) + TypeScript**. Eine Codebasis für
> **iOS und Android**.

---

## ✨ Was ist alles drin?

| Bereich            | Enthalten                                                        |
| ------------------ | --------------------------------------------------------------- |
| 🧭 **Navigation**  | Expo Router (dateibasiert), Tabs, geschützte Bereiche           |
| 🔐 **Anmeldung**   | Login, Registrierung, Passwort-Reset (Supabase Auth)            |
| 👥 **Benutzerrollen** | Profile mit Rollen (`user` / `admin`) via Row-Level-Security |
| 🗄️ **Datenbank**   | Postgres via Supabase, Beispiel-CRUD („Einträge")               |
| 💳 **Zahlungen**   | Stripe-Grundgerüst (App + Server-Funktion)                       |
| 🔔 **Push**        | Benachrichtigungen (Expo Notifications)                          |
| 🎨 **Design**      | Theme-System mit Hell-/Dunkelmodus                              |
| 🌍 **Sprachen**    | Mehrsprachig (Deutsch/Englisch), leicht erweiterbar             |
| ✅ **Formulare**    | React Hook Form + Zod-Validierung                              |
| 🧪 **Tests**       | Jest + Testing Library, Beispiel-Tests                          |
| 🧹 **Qualität**    | ESLint, Prettier, TypeScript strict                            |
| 🤖 **CI**          | GitHub Actions (Lint, Typen, Tests bei jedem Push)             |
| 📦 **State**       | Zustand (App-Zustand) + TanStack Query (Server-Daten)          |

---

## 🚀 Schnellstart

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Konfiguration anlegen
cp .env.example .env
#    -> Supabase-Werte in .env eintragen (siehe supabase/README.md)

# 3. Datenbank-Schema einspielen
#    -> supabase/migrations/0001_init.sql im Supabase-Dashboard ausführen

# 4. App starten
npm start
```

Dann die **Expo Go**-App auf dem Handy öffnen und den QR-Code scannen.

> ℹ️ Beim ersten Start empfiehlt sich `npx expo install --fix`, damit alle
> Paketversionen exakt zur Expo-Version passen.

---

## 📂 Projektstruktur (Kurzfassung)

```
app/          Bildschirme & Navigation
src/          Der eigentliche Code (Features, UI, Logik)
supabase/     Backend: Datenbank, Sicherheit, Server-Funktionen
docs/         Dokumentation & Checklisten
```

Ausführlich erklärt in [`docs/architecture.md`](docs/architecture.md).

---

## 🆕 Neue App daraus bauen

Die Schritt-für-Schritt-Anleitung steht in
[`docs/neue-app-checkliste.md`](docs/neue-app-checkliste.md).

Kurz gesagt: kopieren → umbenennen → Supabase verbinden → loslegen.

---

## 🛠️ Nützliche Befehle

```bash
npm start          # Entwicklungsserver starten
npm run android    # direkt auf Android starten
npm run ios        # direkt auf iOS starten
npm run lint       # Code-Stil prüfen
npm run typecheck  # TypeScript-Typen prüfen
npm test           # Tests ausführen
npm run format     # Code automatisch formatieren
```

---

## 🧩 Warum dieser Aufbau?

- **Feature-orientiert:** Jedes Feature (`auth`, `items`, `billing`) liegt in
  sich geschlossen in `src/features/`. Neues Feature = neuer Ordner nach dem
  gleichen Muster. Alte Features lassen sich sauber löschen.
- **Eine Quelle der Wahrheit:** Konfiguration (`src/lib/config.ts`), Design
  (`src/theme/`) und Typen (`src/types/`) sind zentral. Änderungen wirken
  überall.
- **Sicherheit an der richtigen Stelle:** Die Datenzugriffe sind in der
  Datenbank abgesichert (RLS), nicht nur in der App.

Details und Begründungen: [`docs/architecture.md`](docs/architecture.md).

---

## 📄 Lizenz

MIT – frei nutzbar. Siehe [`LICENSE`](LICENSE).
