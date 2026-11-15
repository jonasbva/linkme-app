-- Separate revocable, expiring keys for the versioned dashboard API.
-- No existing dashboard data or permissions are changed by this migration.
begin;

create table public.dashboard_api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  prefix text not null,
  user_id uuid not null references public.admin_users(id) on delete cascade,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  rate_window timestamptz,
  rate_count integer not null default 0 check (rate_count >= 0)
);
create index dashboard_api_keys_user_idx on public.dashboard_api_keys (user_id);
create index dashboard_api_keys_created_by_idx on public.dashboard_api_keys (created_by);

create table public.dashboard_api_requests (
  id uuid primary key default gen_random_uuid(),
  key_id uuid references public.dashboard_api_keys(id) on delete set null,
  user_id uuid references public.admin_users(id) on delete set null,
  method text not null,
  path text not null,
  status integer not null check (status between 100 and 599),
  duration_ms integer not null check (duration_ms >= 0),
  created_at timestamptz not null default now()
);
create index dashboard_api_requests_created_idx on public.dashboard_api_requests (created_at desc);
create index dashboard_api_requests_key_idx on public.dashboard_api_requests (key_id, created_at desc);
create index dashboard_api_requests_user_idx on public.dashboard_api_requests (user_id);

alter table public.dashboard_api_keys enable row level security;
alter table public.dashboard_api_requests enable row level security;
-- Dashboard sessions use app-level RBAC and the server service role. Neither
-- public Supabase role may read hashes, issue keys, or alter the audit log.
revoke all on public.dashboard_api_keys from public, anon, authenticated;
revoke all on public.dashboard_api_requests from public, anon, authenticated;
grant select, insert, update, delete on public.dashboard_api_keys to service_role;
grant select, insert, delete on public.dashboard_api_requests to service_role;

-- A row lock makes revocation/expiry/activity validation and rate accounting
-- atomic across serverless instances. Every call returns the user's CURRENT
-- privileges; no privileges are encoded into the bearer token.
create function public.consume_dashboard_api_key(p_key_hash text)
returns table (
  key_id uuid,
  user_id uuid,
  email text,
  display_name text,
  is_super_admin boolean,
  rate_limited boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_key public.dashboard_api_keys%rowtype;
  v_user public.admin_users%rowtype;
  v_now timestamptz;
  v_window timestamptz;
  v_limited boolean;
begin
  select k.* into v_key from public.dashboard_api_keys k
    where k.key_hash = p_key_hash for update;
  -- Measure after acquiring the lock, including time spent waiting for a
  -- concurrent request or revocation.
  v_now := clock_timestamp();
  v_window := date_trunc('minute', v_now);
  if not found or v_key.revoked_at is not null or v_key.expires_at <= v_now then
    return;
  end if;
  select u.* into v_user from public.admin_users u
    where u.id = v_key.user_id and u.is_active = true;
  if not found then return; end if;

  v_limited := v_key.rate_window = v_window and v_key.rate_count >= 120;
  if not coalesce(v_limited, false) then
    update public.dashboard_api_keys k set
      last_used_at = v_now,
      rate_window = v_window,
      rate_count = case when k.rate_window = v_window then k.rate_count + 1 else 1 end
    where k.id = v_key.id;
  end if;
  return query select v_key.id, v_user.id, v_user.email,
    v_user.display_name, coalesce(v_user.is_super_admin, false), coalesce(v_limited, false);
end;
$$;
revoke all on function public.consume_dashboard_api_key(text) from public, anon, authenticated;
grant execute on function public.consume_dashboard_api_key(text) to service_role;

commit;
