-- =============================================================================
-- Bind tracking links to Infloww  (APPLIED 2026-10-26)
-- =============================================================================
-- Each IG account carries one OF tracking link in its bio. Infloww counts the
-- clicks and subs that link produced, so binding a tracking_links row to its
-- Infloww counterpart replaces hand-entered click numbers with real ones.
--
-- Infloww reports CUMULATIVE counters, so a day's figures are the difference
-- between two daily snapshots — hence infloww_link_snapshots.
-- =============================================================================

alter table tracking_links
  add column if not exists infloww_link_id   text,
  add column if not exists infloww_link_name text,
  add column if not exists infloww_code      text,
  add column if not exists infloww_synced_at timestamptz;

-- One Infloww link belongs to at most one tracking link.
create unique index if not exists idx_tracking_links_infloww_link_id
  on tracking_links(infloww_link_id) where infloww_link_id is not null;

create table if not exists infloww_link_snapshots (
  id                     uuid primary key default gen_random_uuid(),
  tracking_link_id       uuid not null references tracking_links(id) on delete cascade,
  date                   date not null,
  click_count            bigint not null default 0,
  sub_count              integer not null default 0,
  earnings_gross_cents   bigint not null default 0,
  earnings_net_cents     bigint not null default 0,
  paying_fans_count      integer not null default 0,
  subscription_cvr       numeric,
  spending_cvr           numeric,
  captured_at            timestamptz not null default now(),
  unique (tracking_link_id, date)
);

create index if not exists idx_infloww_link_snapshots_link_date
  on infloww_link_snapshots(tracking_link_id, date desc);

alter table infloww_link_snapshots enable row level security;

-- Infloww-derived values live BESIDE the manual ones, never on top of them:
-- the sync upsert names only these columns, so views / profile_views /
-- link_clicks survive untouched. NULL = Infloww had nothing for that day.
alter table link_daily
  add column if not exists infloww_clicks             integer,
  add column if not exists infloww_new_subs           integer,
  add column if not exists infloww_earnings_net_cents bigint;
