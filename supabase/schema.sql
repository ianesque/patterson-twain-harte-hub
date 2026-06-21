-- Patterson Twain Harte Trip Hub — one-time Supabase setup
-- Run in Supabase SQL Editor for your project.

create table if not exists public.trip_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into public.trip_state (id, payload, updated_by)
values ('twain-harte-2026', '{}'::jsonb, 'system')
on conflict (id) do nothing;

alter table public.trip_state enable row level security;

create policy "Allow anon read trip_state"
  on public.trip_state for select
  to anon
  using (true);

create policy "Allow anon write trip_state"
  on public.trip_state for insert
  to anon
  with check (true);

create policy "Allow anon update trip_state"
  on public.trip_state for update
  to anon
  using (true)
  with check (true);

alter publication supabase_realtime add table public.trip_state;
