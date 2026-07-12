import { supabase } from '@/lib/supabase';
import type { Item, ItemInsert, ItemUpdate } from '@/types/database';

/**
 * Datenzugriff für "items".
 * Reine Funktionen ohne React – dadurch leicht testbar und wiederverwendbar.
 * Dank Row-Level-Security (siehe Migration) sieht jeder Nutzer nur seine
 * eigenen Einträge; das erzwingt die Datenbank, nicht der Client.
 */
export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchItem(id: string): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createItem(
  input: Omit<ItemInsert, 'user_id'>,
): Promise<Item> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht angemeldet');

  const { data, error } = await supabase
    .from('items')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, input: ItemUpdate): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}
