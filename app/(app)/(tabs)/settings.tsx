import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useGameStore } from '@/features/game/store';
import i18n from '@/i18n';
import {
  useSettingsStore,
  type Language,
  type ThemePreference,
} from '@/store/settingsStore';

/**
 * Einstellungen: Design (hell/dunkel/system) und Sprache umschalten.
 * Beide Werte werden dauerhaft gespeichert (settingsStore).
 */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const { themePreference, language, setThemePreference, setLanguage } =
    useSettingsStore();
  const resetGame = useGameStore((s) => s.resetGame);

  const changeLanguage = (lng: Language) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  const confirmReset = () => {
    Alert.alert(t('game.settings.resetTitle'), t('game.settings.resetMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('game.settings.resetConfirm'),
        style: 'destructive',
        onPress: resetGame,
      },
    ]);
  };

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t('settings.themeSystem') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];

  return (
    <Screen scroll>
      <Text variant="h1">{t('settings.title')}</Text>

      <Card style={styles.card}>
        <Text variant="h3">{t('settings.theme')}</Text>
        <View style={styles.row}>
          {themeOptions.map((opt) => (
            <Button
              key={opt.value}
              title={opt.label}
              variant={themePreference === opt.value ? 'primary' : 'secondary'}
              onPress={() => setThemePreference(opt.value)}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text variant="h3">{t('settings.language')}</Text>
        <View style={styles.row}>
          <Button
            title="Deutsch"
            variant={language === 'de' ? 'primary' : 'secondary'}
            onPress={() => changeLanguage('de')}
          />
          <Button
            title="English"
            variant={language === 'en' ? 'primary' : 'secondary'}
            onPress={() => changeLanguage('en')}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text variant="h3">{t('game.settings.saveTitle')}</Text>
        <Text variant="caption" muted>
          {t('game.settings.resetHint')}
        </Text>
        <Button
          title={t('game.settings.resetTitle')}
          variant="danger"
          onPress={confirmReset}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, marginTop: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
