-- ============================================================================
-- Security: RLS / privilege hardening (2026-06-05)
--
-- WHY:
-- The app accesses Postgres exclusively with the Supabase SERVICE ROLE key
-- (server-side API routes + server components via createServerSupabaseClient).
-- The public ANON key — which ships inside the browser bundle — is NOT used for
-- any database access in application code.
--
-- However, several tables carried permissive `USING (true)` RLS policies (or
-- blanket "<table>_all" FOR ALL policies). Combined with the public anon key,
-- anyone could read/write highly sensitive data directly through the Supabase
-- REST API: admin_users (password hashes), infloww_config (the Infloww API
-- key), revenue_*, conversion_*, social_*, etc.
--
-- WHAT THIS DOES:
-- Locks the anon + authenticated roles out of every sensitive table and drops
-- the permissive policies. The service role bypasses RLS and keeps full access,
-- so the application is unaffected. Only the public LinkMe creator-page surfaces
-- (active creators + active links) stay publicly readable.
--
-- This app does not use Supabase Auth, so the `authenticated` role is unused too
-- and is revoked alongside `anon` for defense in depth.
--
-- Review before applying. Idempotent — safe to run multiple times.
-- ============================================================================

-- 1. Ensure RLS is enabled on every table (no-op where already on).
--    conversion_accounts and scrape_jobs previously had RLS disabled.
alter table if exists public.creators                 enable row level security;
alter table if exists public.links                    enable row level security;
alter table if exists public.clicks                   enable row level security;
alter table if exists public.social_accounts          enable row level security;
alter table if exists public.social_snapshots         enable row level security;
alter table if exists public.social_posts             enable row level security;
alter table if exists public.conversion_accounts      enable row level security;
alter table if exists public.conversion_daily         enable row level security;
alter table if exists public.conversion_expectations  enable row level security;
alter table if exists public.revenue_expectations     enable row level security;
alter table if exists public.revenue_emergency_status enable row level security;
alter table if exists public.revenue_cache            enable row level security;
alter table if exists public.infloww_config           enable row level security;
alter table if exists public.infloww_creator_map      enable row level security;
alter table if exists public.infloww_creators_cache   enable row level security;
alter table if exists public.admin_users              enable row level security;
alter table if exists public.admin_roles              enable row level security;
alter table if exists public.admin_user_roles         enable row level security;
alter table if exists public.admin_permissions        enable row level security;
alter table if exists public.admin_creator_access     enable row level security;
alter table if exists public.tags                     enable row level security;
alter table if exists public.creator_tags             enable row level security;
alter table if exists public.scrape_jobs              enable row level security;
alter table if exists public.error_logs               enable row level security;

-- 2. Drop ALL existing policies on these tables (removes any USING(true) leftovers).
do $$
declare
  r record;
  tbls text[] := array[
    'creators','links','clicks','social_accounts','social_snapshots','social_posts',
    'conversion_accounts','conversion_daily','conversion_expectations',
    'revenue_expectations','revenue_emergency_status','revenue_cache',
    'infloww_config','infloww_creator_map','infloww_creators_cache',
    'admin_users','admin_roles','admin_user_roles','admin_permissions',
    'admin_creator_access','tags','creator_tags','scrape_jobs','error_logs'
  ];
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename = any(tbls)
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 3. Revoke direct table privileges from the public-facing roles on every
--    sensitive table. The service role bypasses both grants and RLS.
revoke all on public.clicks                   from anon, authenticated;
revoke all on public.social_accounts          from anon, authenticated;
revoke all on public.social_snapshots         from anon, authenticated;
revoke all on public.social_posts             from anon, authenticated;
revoke all on public.conversion_accounts      from anon, authenticated;
revoke all on public.conversion_daily         from anon, authenticated;
revoke all on public.conversion_expectations  from anon, authenticated;
revoke all on public.revenue_expectations     from anon, authenticated;
revoke all on public.revenue_emergency_status from anon, authenticated;
revoke all on public.revenue_cache            from anon, authenticated;
revoke all on public.infloww_config           from anon, authenticated;
revoke all on public.infloww_creator_map      from anon, authenticated;
revoke all on public.infloww_creators_cache   from anon, authenticated;
revoke all on public.admin_users              from anon, authenticated;
revoke all on public.admin_roles              from anon, authenticated;
revoke all on public.admin_user_roles         from anon, authenticated;
revoke all on public.admin_permissions        from anon, authenticated;
revoke all on public.admin_creator_access     from anon, authenticated;
revoke all on public.tags                     from anon, authenticated;
revoke all on public.creator_tags             from anon, authenticated;
revoke all on public.scrape_jobs              from anon, authenticated;
revoke all on public.error_logs               from anon, authenticated;

-- 4. Public LinkMe page surfaces: keep active creators + active links readable
--    by the public (the link-in-bio pages). SELECT-only.
grant select on public.creators to anon, authenticated;
grant select on public.links    to anon, authenticated;

create policy "Public can read active creators"
  on public.creators for select
  to anon, authenticated
  using (is_active = true);

create policy "Public can read active links"
  on public.links for select
  to anon, authenticated
  using (is_active = true);

-- NOTE:
-- After applying, sanity-check from the SQL editor with the anon role, e.g.:
--   set role anon;
--   select * from admin_users;          -- expect: permission denied
--   select * from infloww_config;       -- expect: permission denied
--   select slug from creators limit 1;  -- expect: only active creators
--   reset role;
