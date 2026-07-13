# 🏝️ Wolkenfeste – Spieldesign

**Wolkenfeste** ist ein Aufbau-Strategiespiel mit Idle-Elementen für iOS und
Android. Es ist eine **vollständig eigenständige Schöpfung**: Welt, Name,
Geschichte, Ressourcen, Gebäude, Texte und alle Zahlenwerte wurden für dieses
Projekt neu entworfen. Es werden keine Grafiken, Texte, Namen oder Daten
anderer Spiele verwendet. (Spiel*mechaniken* als solche – z. B. „Gebäude
kosten Ressourcen und brauchen Bauzeit" – sind rechtlich nicht schützbar und
Allgemeingut des Genres.)

---

## 🌍 Die Welt

Vor Generationen zerbrach die Welt in der **Großen Zerreißung**. Was blieb,
sind schwebende Inseln über einem endlosen Wolkenmeer, getragen von
**Aether** – der geheimnisvollen Kraft, die den Trümmern das Fliegen schenkt.

Du bist **Hüterin oder Hüter** einer jungen Himmelsinsel. Baue sie zu einer
blühenden Wolkenfeste aus, erforsche das Nebelmeer mit Gleitern und sammle
den Aether der alten Welt.

---

## 📦 Ressourcen

| Ressource      | Symbol | Quelle                            | Zweck                    |
| -------------- | ------ | --------------------------------- | ------------------------ |
| **Luftkorn**   | 🌾     | Windmühle                         | Bauen, Gleiter ausbilden |
| **Schwebholz** | 🪵     | Wolkenhain                        | Bauen                    |
| **Nebelstein** | 🪨     | Nebelbruch                        | Bauen (höhere Stufen)    |
| **Aether**     | ✨     | Kollektor, Expeditionen, Aufgaben | Segen (dauerhafte Boni)  |

Luftkorn, Schwebholz und Nebelstein sind durch den **Himmelsspeicher**
begrenzt. Aether ist unbegrenzt, aber selten.

---

## 🏗️ Gebäude

Alle Gebäude haben **Stufe 0–10**. Kein Gebäude kann höher sein als das
Himmelsdock (klassisches „HQ-Gate").

| Gebäude                | Funktion                                             | Freischaltung |
| ---------------------- | ---------------------------------------------------- | ------------- |
| 🏰 **Himmelsdock**     | Herz der Insel, begrenzt alle anderen Gebäudestufen  | Start (St. 1) |
| 🌾 **Windmühle**       | Produziert Luftkorn                                  | Start (St. 1) |
| 🌳 **Wolkenhain**      | Produziert Schwebholz                                | Start (St. 1) |
| ⛏️ **Nebelbruch**      | Produziert Nebelstein                                | Dock 1        |
| 🏺 **Himmelsspeicher** | Erhöht das Lager-Limit                               | Dock 1        |
| 🗼 **Wachtturm**       | Schaltet Expeditionen frei, verbessert Ausbeute      | Dock 2        |
| 🪂 **Gleiterwerft**    | Bildet Gleiter aus (Expeditionstrupps), erhöht Limit | Dock 2        |
| 🔮 **Aetherkollektor** | Sammelt langsam Aether, stark bei Nacht/Aetherregen  | Dock 3        |

**Bau-Warteschlange:** Ein Bautrupp (ein Bau gleichzeitig). Ein zweiter
Bautrupp ist über einen Segen freischaltbar.

### Balancing-Formeln

- **Produktion/Stunde** (Stufe L): `basis × L × 1,15^(L−1)`
- **Ausbaukosten** auf Stufe L: `basis × 1,55^(L−1)` je Ressource
- **Bauzeit** auf Stufe L: `basis × 1,9^(L−1)`
- **Lagerlimit** (Speicher-Stufe L): `400 × 1,6^L` je Ressource

---

## 🌬️ Windstrom & Wetter (das Besondere ✨)

Die Atmosphäre lebt – **an echte Uhrzeit gekoppelt** und für alle Spieler
deterministisch gleich:

- **Windstrom** (wechselt alle 2 Stunden): Der Wind begünstigt eine
  Ressource mit **+35 % Produktion**. Die **Windvorhersage** zeigt die
  nächsten Fenster – wer klug plant, legt Ausbauten und Sammelphasen in den
  richtigen Wind.
- **Wetterfronten** (wechseln alle 3 Stunden):
  - ☀️ **Klarhimmel** – keine Effekte
  - 🌫️ **Nebelbank** – Nebelstein +30 %, Luftkorn −10 %
  - 🌪️ **Sturmfront** – Schwebholz +40 %, Luftkorn −15 %
  - 💜 **Aetherregen** (selten) – Aetherkollektor ×2
- **Tag & Nacht** (echte Ortszeit): Nachts (20–6 Uhr) sammelt der
  Aetherkollektor **+50 %**.

Technisch: Beide Systeme werden aus dem Zeitfenster-Index deterministisch
per Seed-RNG berechnet – keine Server nötig, kein Speichern, vorhersagbar
und exakt testbar. Die Offline-Produktion wird **fensterweise aufsummiert**
(nicht pauschal), Wind- und Wetterwechsel während der Abwesenheit zählen
also korrekt.

---

## 🪂 Expeditionen

Gleiter erkunden das Wolkenmeer. Vier Ziele mit steigendem Risiko:

| Ziel                | Dauer  | Gleiter | Wachtturm |
| ------------------- | ------ | ------- | --------- |
| 🏝️ Nahe Inseln      | 15 min | 3       | Stufe 1   |
| 🌫️ Nebelmeer        | 1 h    | 8       | Stufe 3   |
| 🌪️ Sturmgürtel      | 4 h    | 15      | Stufe 5   |
| 🏛️ Vergessene Höhen | 8 h    | 25      | Stufe 7   |

**Rückkehr mit Geschichte:** Jede Expedition endet mit einem erzählten
**Ereignis** (10 handgeschriebene, eigene Szenarien) und **2–3
Entscheidungen** – vorsichtig, mutig oder neugierig. Die Wahl beeinflusst
Beute, Aether-Funde und ob Gleiter verloren gehen. Ausgang ist per
Expeditions-Seed deterministisch, aber vorher nicht ablesbar.

---

## ⚔️ Bestienjagd (Kämpfe)

Ab Wachtturm Stufe 2 lassen sich **Himmelsbestien** stellen – die
Kampf-Schiene des Spiels:

| Bestie             | Dauer  | Gleiter | Kraft | Wachtturm |
| ------------------ | ------ | ------- | ----- | --------- |
| 🐍 Nebelschlange   | 30 min | 5       | 55    | Stufe 2   |
| 🦅 Sturmrok        | 2 h    | 12      | 150   | Stufe 4   |
| 🐋 Wolkenleviathan | 6 h    | 22      | 300   | Stufe 6   |

- **Kampfkraft:** Jeder Gleiter kämpft mit `10 + 2 × (Werft−1)` Kraft.
  Die Werft auszubauen stärkt also den ganzen Trupp.
- **Auflösung:** Beide Seiten würfeln ihre Kraft × (0,85…1,15), per
  Seed deterministisch. Vor dem Start zeigt die UI eine ehrliche
  Einschätzung (gute Chancen / ausgeglichen / riskant).
- **Sieg:** volle Beute + Aether, geringe Verluste (je klarer der Sieg,
  desto weniger). **Niederlage:** halber Trupp verloren, nur ein
  Trostpreis. Es läuft höchstens eine Jagd gleichzeitig.

## 📜 Aufgaben (Quests)

Eine geführte Kette von 17 Aufgaben führt durch alle Systeme (Dock-Ausbau
→ erste Ausbauten → Wachtturm → erste Expedition → Kollektor → erster
Segen). Die erste Aufgabe ist bewusst das Himmelsdock: Sie lehrt die
zentrale Regel, dass kein Gebäude höher sein kann als das Dock.
Belohnungen werden aktiv abgeholt.

## ✨ Segen (Aether-Verwendung)

Dauerhafte Boni als Langzeitmotivation:

| Segen               | Wirkung                         | Stufen |
| ------------------- | ------------------------------- | ------ |
| 🌬️ Rückenwind       | +10 % Produktion je Stufe       | 3      |
| 🔨 Fleißige Hände   | −10 % Bauzeit je Stufe          | 3      |
| 🔭 Weitblick        | +15 % Expeditionsbeute je Stufe | 3      |
| 👷 Zweiter Bautrupp | Zweite Bau-Warteschlange        | 1      |

## 📖 Chronik

Die Insel schreibt Geschichte: Jeder fertige Ausbau, jede Expedition, jede
Aufgabe landet mit Zeitstempel in der **Inselchronik** – ein Tagebuch des
eigenen Fortschritts.

## 🕰️ Offline-Fortschritt

Die Insel arbeitet weiter, wenn die App zu ist (bis zu **8 Stunden**
angerechnet). Beim Rückkehren zeigt eine „Willkommen zurück"-Übersicht, was
passiert ist.

---

## 🧱 Technische Architektur

- **Engine** (`src/features/game/engine/`): Reines TypeScript, keine
  React-Abhängigkeit. Alle Regeln sind **pure Funktionen**
  (`Zustand + Zeitpunkt → neuer Zustand`) und vollständig unit-getestet.
- **Store** (`src/features/game/store.ts`): Zustand + `persist`
  (AsyncStorage). Ein Sekunden-Tick treibt die Engine; beim App-Start wird
  die Offline-Zeit angerechnet.
- **UI** (`app/(app)/(tabs)/…`): Drei Spiel-Tabs (Insel, Expeditionen,
  Reich) auf Basis des vorhandenen Design-Systems, hell/dunkel, DE/EN.
- **Gast-Modus:** Das Spiel läuft komplett lokal und ohne Konto. Supabase
  (Login, spätere Cloud-Speicherstände/Ranglisten) bleibt vorbereitet.

## 🗺️ Roadmap (nächste Ausbaustufen)

1. **Cloud-Speicherstand** über Supabase (Spielstand synchronisieren)
2. **Rangliste** (Inselwert) und Saison-Events
3. **Asynchrones PvP**: fremde (gespeicherte) Inseln erkunden
4. **Relikte/Helden**-System aus den Vergessenen Höhen
5. Eigene Grafiken/Sounds (bisher bewusst Emoji-Platzhalter)
