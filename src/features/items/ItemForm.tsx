import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { itemSchema, type ItemInput } from './schema';
import { Button, Input } from '@/components/ui';

type Props = {
  defaultValues?: Partial<ItemInput>;
  submitting?: boolean;
  onSubmit: (values: ItemInput) => void;
};

/**
 * Wiederverwendbares Formular für "Neu anlegen" und "Bearbeiten".
 * Ein Formular für beide Fälle spart Duplikate.
 */
export function ItemForm({ defaultValues, submitting, onSubmit }: Props) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
    },
  });

  return (
    <View>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('items.name')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('items.description')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            style={{ height: 100, paddingTop: 12, textAlignVertical: 'top' }}
            error={errors.description?.message}
          />
        )}
      />
      <Button
        title={t('common.save')}
        loading={submitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
