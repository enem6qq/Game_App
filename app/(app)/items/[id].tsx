import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Screen, StateView, Text } from '@/components/ui';
import { ItemForm } from '@/features/items/ItemForm';
import {
  useDeleteItem,
  useItem,
  useUpdateItem,
} from '@/features/items/hooks';
import type { ItemInput } from '@/features/items/schema';

/**
 * Detail-/Bearbeiten-Ansicht eines Eintrags.
 * "[id]" im Dateinamen macht daraus eine dynamische Route.
 */
export default function ItemDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useItem(id);
  const update = useUpdateItem();
  const remove = useDeleteItem();

  const onSubmit = async (values: ItemInput) => {
    await update.mutateAsync({
      id,
      input: { name: values.name, description: values.description || null },
    });
    router.back();
  };

  const onDelete = () => {
    Alert.alert(t('common.delete'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await remove.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading || error || !data) {
    return (
      <Screen>
        <StateView loading={isLoading} error={error} onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text variant="h1" style={styles.title}>
        {data.name}
      </Text>

      <ItemForm
        defaultValues={{ name: data.name, description: data.description ?? '' }}
        submitting={update.isPending}
        onSubmit={onSubmit}
      />

      <View style={styles.spacer} />
      <Button
        title={t('common.delete')}
        variant="danger"
        loading={remove.isPending}
        onPress={onDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 24 },
  spacer: { height: 16 },
});
