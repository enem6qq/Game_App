# 🏝️ Wolkenfeste

**Wolkenfeste** ist ein Aufbau-Strategiespiel für iOS und Android: Nach der
Großen Zerreißung schwebt die Welt in Inseln über einem endlosen Wolkenmeer.
Baue deine Himmelsinsel aus, plane mit **Windstrom und Wetterfronten**,
schicke **Gleiter auf Expeditionen** mit erzählten Ereignissen und
Entscheidungen – und sammle **Aether** für dauerhafte Segen.

> Gebaut mit **Expo (React Native) + TypeScript**. Eine Codebasis für
> iOS und Android. **Sofort spielbar – ohne Konto, ohne Backend.**

Das komplette Spieldesign (Welt, Systeme, Balancing-Formeln) steht in
[`docs/game-design.md`](docs/game-design.md).

---

## ✨ Was das Spiel besonders macht

- 🌬️ **Windstrom & Wetter in Echtzeit:** Wind (alle 2 h) und Wetterfronten
  (alle 3 h) verändern die Produktion – deterministisch aus der echten
  Uhrzeit berechnet, mit **Vorhersage** zum Planen. Nachts sammelt der
  Aetherkollektor mehr.
- 🪂 **Expeditionen mit Geschichten:** Jede Rückkehr endet in einem von
  zehn handgeschriebenen Ereignissen mit Entscheidungen – vorsichtig,
  mutig oder neugierig?
- ⚔️ **Bestienjagd:** Nebelschlange, Sturmrok und Wolkenleviathan fordern
  den Gleitertrupp zum Kampf – mit Kampfkraft, Risikoeinschätzung und
  Kampfbericht.
- 🎨 **Lebendige Inselszene:** Selbst gezeichnete Vektorgrafik; der Himmel
  folgt der echten Uhrzeit und dem Spielwetter, gebaute Gebäude erscheinen
  auf der Insel.
- 🕰️ **Offline-Fortschritt:** Die Insel arbeitet bis zu 8 Stunden weiter;
  Wetterwechsel während der Abwesenheit werden **fensterweise exakt**
  angerechnet.
- 📖 **Inselchronik:** Jeder Ausbau, jede Expedition, jede Aufgabe wird
  Teil der Geschichte deiner Insel.
- ✨ **Segen:** Aether aus Expeditionen und Aufgaben fließt in dauerhafte
  Boni (Produktion, Bauzeit, Beute, zweiter Bautrupp).

Alle Inhalte (Welt, Namen, Texte, Zahlen) sind **eigens für dieses Projekt
entworfen** – keine fremden Assets oder Texte.

---

## 🚀 Schnellstart

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. App starten
npm start
```

Dann die **Expo Go**-App auf dem Handy öffnen, QR-Code scannen und im
Login-Screen **„Ohne Konto spielen"** wählen – fertig.

> ℹ️ Beim ersten Start empfiehlt sich `npx expo install --fix`, damit alle
> Paketversionen exakt zur Expo-Version passen.
>
> Eine `.env` ist **optional** (siehe `.env.example`) und erst für spätere
> Online-Funktionen (Supabase-Konto, Cloud-Spielstand) nötig.

---

## 📂 Projektstruktur (Kurzfassung)

```
app/                    Screens & Navigation (Expo Router)
  (app)/(tabs)/         Insel · Expeditionen · Reich · Profil · Einstellungen
src/features/game/
  engine/               Spiel-Engine: pures TypeScript, vollständig getestet
  components/           Spiel-UI-Bausteine (Ressourcen, Wetter, Gebäude …)
  store.ts              Spielstand (Zustand + persist, AsyncStorage)
src/                    Design-System, Auth, i18n (DE/EN), Konfiguration
supabase/               Vorbereitetes Backend für spätere Online-Funktionen
docs/                   game-design.md, architecture.md
```

**Architektur-Grundsatz:** Alle Spielregeln leben als pure Funktionen in
`src/features/game/engine/` (Zustand + Zeitpunkt → neuer Zustand) – ohne
React-Abhängigkeit, deterministisch und per Jest abgesichert. UI und Store
sind dünne Schichten darüber.

---

## 🛠️ Nützliche Befehle

```bash
npm start          # Entwicklungsserver starten
npm run android    # direkt auf Android starten
npm run ios        # direkt auf iOS starten
npm run lint       # Code-Stil prüfen
npm run typecheck  # TypeScript-Typen prüfen
npm test           # Tests ausführen (55 Tests, u. a. komplette Engine)
npm run format     # Code automatisch formatieren
```

---

## 🗺️ Roadmap

1. Cloud-Spielstand über Supabase (Konto-Login ist schon vorbereitet)
2. Rangliste (Inselwert) und Saison-Events
3. Asynchrones Erkunden fremder Inseln
4. Relikte/Helden aus den Vergessenen Höhen
5. Eigene Grafiken & Sound (aktuell bewusst Emoji-Platzhalter)
6. Push-Benachrichtigung „Dein Ausbau ist fertig" (expo-notifications ist
   bereits eingerichtet)

---

## 📄 Lizenz

MIT – siehe [`LICENSE`](LICENSE).
