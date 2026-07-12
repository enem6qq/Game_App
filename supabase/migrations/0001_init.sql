-- ────────────────────────────────────────────────────────────────
--  Basis-Schema der App-Vorlage
--  Enthält: Benutzerprofile mit Rollen, Beispiel-Tabelle "items"
--  und Row-Level-Security (RLS), damit jeder Nutzer nur seine
--  eigenen Daten sieht – erzwungen von der Datenbank, nicht vom Client.
-- ────────────────────────────────────────────────────────────────

-- Rollen als Aufzählungstyp.
create type public.user_role as enum ('user', 'admin');

-- ── Profile ──────────────────────────────────────────────────────
-- Jede Anmeldung in auth.users bekommt ein Profil in dieser Tabelle.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  role       public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Jeder darf sein eigenes Profil lesen und ändern.
create policy "Profile lesen (eigenes)"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profile ändern (eigenes)"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatisch ein Profil anlegen, sobald sich jemand registriert.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Beispiel-Tabelle: items ──────────────────────────────────────
create table public.items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.items enable row level security;

-- RLS: Nutzer sehen/ändern ausschließlich ihre eigenen Einträge.
create policy "Einträge lesen (eigene)"
  on public.items for select
  using (auth.uid() = user_id);

create policy "Einträge anlegen (eigene)"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "Einträge ändern (eigene)"
  on public.items for update
  using (auth.uid() = user_id);

create policy "Einträge löschen (eigene)"
  on public.items for delete
  using (auth.uid() = user_id);

-- updated_at bei jeder Änderung automatisch aktualisieren.
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- Index für schnelles Laden der Einträge eines Nutzers.
create index items_user_id_idx on public.items (user_id);
