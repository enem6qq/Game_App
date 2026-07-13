-- ─────────────────────────────────────────────────────────────────
--  Cloud-Spielstände für Wolkenfeste
--  Eine Zeile pro Nutzer; der komplette Spielstand liegt als JSON.
--  Im Supabase-Dashboard unter "SQL Editor" ausführen.
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.game_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row-Level-Security: Jeder Nutzer sieht und ändert NUR den eigenen Stand.
alter table public.game_saves enable row level security;

create policy "game_saves_select_own"
  on public.game_saves for select
  using (auth.uid() = user_id);

create policy "game_saves_insert_own"
  on public.game_saves for insert
  with check (auth.uid() = user_id);

create policy "game_saves_update_own"
  on public.game_saves for update
  using (auth.uid() = user_id);

create policy "game_saves_delete_own"
  on public.game_saves for delete
  using (auth.uid() = user_id);
