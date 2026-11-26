-- Such-Alerts: gespeicherte Suchen von Käufern, täglich per E-Mail-Digest.
-- Einmalig im Supabase SQL-Editor ausführen. Idempotent (IF NOT EXISTS).

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  query text not null default '',
  refinements jsonb not null default '{}'::jsonb,
  price_min numeric,
  price_max numeric,
  base_filters text,
  base_facet_filters jsonb not null default '[]'::jsonb,
  result_path text not null,
  is_active boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  last_notified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists saved_searches_user_id_idx on public.saved_searches (user_id);
create index if not exists saved_searches_active_idx on public.saved_searches (is_active) where is_active;

alter table public.saved_searches enable row level security;

drop policy if exists "saved_searches_select_own" on public.saved_searches;
create policy "saved_searches_select_own" on public.saved_searches
  for select using (auth.uid() = user_id);

drop policy if exists "saved_searches_insert_own" on public.saved_searches;
create policy "saved_searches_insert_own" on public.saved_searches
  for insert with check (auth.uid() = user_id);

drop policy if exists "saved_searches_delete_own" on public.saved_searches;
create policy "saved_searches_delete_own" on public.saved_searches
  for delete using (auth.uid() = user_id);

-- Kein update-Policy für Nutzer: last_notified_at / is_active setzt nur der
-- Cron bzw. die Abmelde-Route über den Service-Role-Client.
