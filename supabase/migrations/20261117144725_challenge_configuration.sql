-- Server-owned configuration, separate from conversion daily targets. No client
-- role can read or mutate it directly. Existing defaults apply until first edit.
create table public.challenge_configurations (
  id text primary key check (id = 'november-2026'),
  revision integer not null check (revision >= 1),
  participants jsonb not null check (
    jsonb_typeof(participants) = 'array' and jsonb_array_length(participants) = 6
  ),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(id) on delete set null
);

alter table public.challenge_configurations enable row level security;
revoke all on table public.challenge_configurations from public, anon, authenticated;
grant select, insert, update on table public.challenge_configurations to service_role;
create policy challenge_configuration_server_only on public.challenge_configurations
  for all to service_role using (true) with check (true);

comment on table public.challenge_configurations is
  'Versioned November challenge document. App super-admin gate and revision compare-and-swap protect writes; creator moves update every manager atomically.';
