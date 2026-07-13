import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
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

      <View style={styles.spacer} />
      <Button
        title={guestMode ? t('auth.leaveGuest') : t('auth.logout')}
        variant="danger"
        onPress={signOut}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, marginTop: 16 },
  spacer: { height: 24 },
});
