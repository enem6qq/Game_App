import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Screen, Text } from '@/components/ui';
import { ItemForm } from '@/features/items/ItemForm';
import { useCreateItem } from '@/features/items/hooks';
import type { ItemInput } from '@/features/items/schema';

export default function NewItemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const create = useCreateItem();

  const onSubmit = async (values: ItemInput) => {
    await create.mutateAsync({
      name: values.name,
      description: values.description || null,
    });
    router.back();
  };

  return (
    <Screen scroll>
      <Text variant="h1" style={{ marginBottom: 24 }}>
        {t('items.newItem')}
      </Text>
      <ItemForm submitting={create.isPending} onSubmit={onSubmit} />
    </Screen>
  );
}
