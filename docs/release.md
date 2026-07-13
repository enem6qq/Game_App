# 📦 Von Expo Go zur echten App (EAS Build)

Bisher läuft Wolkenfeste über **Expo Go** (QR-Code scannen). Für eine
„richtige" App mit eigenem Icon auf dem Homescreen – und später für die
Stores – baut man mit **EAS Build** (Expos Cloud-Build-Dienst, kostenloses
Kontingent vorhanden). Die Konfiguration (`eas.json`) liegt schon im Projekt.

## Einmalige Vorbereitung

1. Kostenloses Konto auf [expo.dev](https://expo.dev) anlegen.
2. Am Computer (im Projektordner):

```bash
npm install -g eas-cli
eas login          # mit dem expo.dev-Konto anmelden
eas init           # verknüpft das Projekt (legt eine Projekt-ID an)
```

3. **Eigene Kennungen setzen** in `app.config.ts`, bevor der erste echte
   Build läuft (die `com.example.*`-Platzhalter ersetzen), z. B.:
   - `ios.bundleIdentifier`: `de.deinname.wolkenfeste`
   - `android.package`: `de.deinname.wolkenfeste`

## Android-Test-App bauen (der übliche erste Schritt)

```bash
eas build --platform android --profile preview
```

- Dauert ~10–20 min in der Expo-Cloud (nichts weiter nötig).
- Am Ende gibt es einen Link zu einer **APK-Datei**: auf dem Handy öffnen,
  installieren („Unbekannte Quellen" einmalig erlauben) – fertig.
- Vorteil gegenüber Expo Go: eigenes Icon, eigener Name, läuft ohne
  Entwicklungsserver und ohne PC.

## iOS

Für iOS-Builds verlangt Apple eine Mitgliedschaft im
Apple Developer Program (99 €/Jahr):

```bash
eas build --platform ios --profile preview
```

## Store-Veröffentlichung (später)

```bash
eas build --platform android --profile production
eas submit --platform android      # lädt ins Google-Play-Konto hoch
```

Dafür nötig: Google-Play-Entwicklerkonto (einmalig 25 $) bzw. Apple
Developer Program. Außerdem sinnvoll vor dem ersten Release:

- Eigene Icons/Splash (aktuell Platzhalter der Vorlage) in `assets/`
- Datenschutz-Erklärung (Pflicht in beiden Stores)
- `APP_ENV="production"` und ggf. Supabase-Produktionswerte in `.env`

## Profile in `eas.json`

| Profil        | Zweck                                          |
| ------------- | ---------------------------------------------- |
| `development` | Dev-Client für Entwicklung mit nativen Modulen |
| `preview`     | Test-Builds zum Verteilen (Android: APK)       |
| `production`  | Store-Builds mit automatischer Versionsnummer  |
