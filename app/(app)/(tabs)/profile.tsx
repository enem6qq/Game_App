import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { cloudAvailable, downloadSave, uploadSave } from '@/features/game/cloud';
import { ErrorNotice } from '@/features/game/components/ErrorNotice';
import { MAX_ISLAND_NAME_LENGTH } from '@/features/game/engine';
import { useGameStore } from '@/features/game/store';
import { config } from '@/lib/config';

/**
 * Profil: Insel benennen und Konto-Status.
 * Im Gast-Modus läuft alles lokal; ein Konto ist optional und wird
 * erst relevant, wenn Online-Funktionen (Cloud-Spielstand) dazukommen.
 */
export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, guestMode, signOut } = useAuth();
  const islandName = useGameStore((s) => s.state.islandName);
  const setIslandName = useGameStore((s) => s.setIslandName);

  const [name, setName] = useState(islandName);

  return (
    <Screen scroll>
      <ErrorNotice />
      <Text variant="h1">{t('tabs.profile')}</Text>

      <Card style={styles.card}>
        <Text variant="h3">🏝️ {t('game.profile.islandName')}</Text>
        <Input
          label=""
          value={name}
          maxLength={MAX_ISLAND_NAME_LENGTH}
          placeholder={t('game.island.defaultName')}
          onChangeText={setName}
        />
        <Button
          title={t('common.save')}
          disabled={name.trim().length === 0 || name.trim() === islandName}
          onPress={() => setIslandName(name)}
        />
      </Card>

      <Card style={styles.card}>
        <Text variant="caption" muted>
          {t('settings.account')}
        </Text>
        <Text variant="h3">
          {guestMode ? `👤 ${t('game.profile.guest')}` : user?.email}
        </Text>
        <Text variant="caption" muted>
          {guestMode
            ? config.hasSupabase
              ? t('game.profile.guestHint')
              : t('game.profile.localOnly')
            : t('game.profile.accountHint')}
        </Text>
      </Card>

      {!guestMode && user ? <CloudCard userId={user.id} /> : null}

      <View style={styles.spacer} />
      <Button
        title={guestMode ? t('auth.leaveGuest') : t('auth.logout')}
        variant="danger"
        onPress={signOut}
      />
    </Screen>
  );
}

/** Manuelles Sichern/Laden des Spielstands in der Cloud (nur mit Konto). */
function CloudCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const state = useGameStore((s) => s.state);
  const replaceState = useGameStore((s) => s.replaceState);
  const [busy, setBusy] = useState<'up' | 'down' | null>(null);

  if (!cloudAvailable()) return null;

  const onUpload = async () => {
    setBusy('up');
    const result = await uploadSave(userId, state);
    setBusy(null);
    Alert.alert(
      result.ok ? t('game.cloud.savedTitle') : t('common.error'),
      result.ok ? t('game.cloud.savedMessage') : result.message,
    );
  };

  const onDownload = async () => {
    setBusy('down');
    const result = await downloadSave(userId);
    setBusy(null);
    if (!result.ok) {
      Alert.alert(
        t('common.error'),
        result.message === 'no_save' ? t('game.cloud.noSave') : result.message,
      );
      return;
    }
    // Nie ungefragt den lokalen Stand überschreiben.
    Alert.alert(t('game.cloud.loadTitle'), t('game.cloud.loadMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('game.cloud.loadConfirm'),
        style: 'destructive',
        onPress: () => replaceState(result.state),
      },
    ]);
  };

  return (
    <Card style={styles.card}>
      <Text variant="h3">☁️ {t('game.cloud.title')}</Text>
      <Text variant="caption" muted>
        {t('game.cloud.hint')}
      </Text>
      <Button
        title={t('game.cloud.save')}
        loading={busy === 'up'}
        disabled={busy !== null}
        onPress={onUpload}
      />
      <Button
        title={t('game.cloud.load')}
        variant="secondary"
        loading={busy === 'down'}
        disabled={busy !== null}
        onPress={onDownload}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, marginTop: 16 },
  spacer: { height: 24 },
});
