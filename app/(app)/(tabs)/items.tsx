import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, StateView, Text } from '@/components/ui';
import { useItems } from '@/features/items/hooks';

/**
 * Beispiel-Liste (CRUD): zeigt, wie Server-Daten geladen, dargestellt und
 * mit Lade-/Fehler-/Leer-Zuständen abgesichert werden. Als Blaupause für
 * jede eigene Liste in deiner App gedacht.
 */
export default function ItemsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useItems();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h1">{t('items.title')}</Text>
        <Button
          title={t('items.newItem')}
          onPress={() => router.push('/(app)/items/new')}
        />
      </View>

      {isLoading || error ? (
        <StateView loading={isLoading} error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<StateView emptyMessage={t('items.empty')} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/(app)/items/${item.id}`)}>
              <Card style={styles.card}>
                <Text variant="h3">{item.name}</Text>
                {item.description ? (
                  <Text muted numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 12, marginBottom: 16 },
  list: { gap: 12, paddingBottom: 24 },
  card: { gap: 4 },
});
