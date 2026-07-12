import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createItem,
  deleteItem,
  fetchItem,
  fetchItems,
  updateItem,
} from './api';
import type { ItemUpdate } from '@/types/database';

/**
 * React-Hooks rund um "items" auf Basis von TanStack Query.
 * Sie kümmern sich automatisch um Caching, Ladezustände und das
 * Neuladen nach Änderungen (Invalidierung).
 */
const KEY = ['items'] as const;

export function useItems() {
  return useQuery({ queryKey: KEY, queryFn: fetchItems });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchItem(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ItemUpdate }) =>
      updateItem(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
