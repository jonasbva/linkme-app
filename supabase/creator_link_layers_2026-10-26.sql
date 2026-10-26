-- =============================================================================
-- Conversion tracking — creator layer + link layer
-- =============================================================================
-- Model:
--   creators            = the OF account. Subscribers are counted here, because
--                         every IG account's link funnels into this one account.
--   tracking_links      = the links placed in the IG bios (N per creator).
--   link_daily          = per-link daily traffic, entered by hand.
--   creator_daily       = per-creator daily new subs, entered by hand.
--
-- History: creator_daily is backfilled from conversion_daily.new_subs (summed
-- per creator per day). conversion_daily stays untouched as legacy traffic
-- history; link_daily starts empty.
-- =============================================================================

BEGIN;

-- ─── 1. Creator-level daily subs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_daily (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  date       date NOT NULL,
  new_subs   int  NOT NULL DEFAULT 0,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (creator_id, date)
);

CREATE INDEX IF NOT EXISTS idx_creator_daily_creator_date
  ON creator_daily(creator_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_creator_daily_date
  ON creator_daily(date DESC);

-- ─── 2. Creator-level sub target ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_expectations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  daily_sub_target int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (creator_id)
);

-- ─── 3. Tracking links (one per IG bio link) ───────────────────────────────
CREATE TABLE IF NOT EXISTS tracking_links (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  social_account_id uuid REFERENCES social_accounts(id) ON DELETE SET NULL,
  label             text NOT NULL,
  url               text,
  sort_order        int  NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_links_creator
  ON tracking_links(creator_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tracking_links_social_account
  ON tracking_links(social_account_id);

-- ─── 4. Per-link daily traffic ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS link_daily (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id uuid NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
  date             date NOT NULL,
  views            bigint NOT NULL DEFAULT 0,
  profile_views    int    NOT NULL DEFAULT 0,
  link_clicks      int    NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tracking_link_id, date)
);

CREATE INDEX IF NOT EXISTS idx_link_daily_link_date
  ON link_daily(tracking_link_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_link_daily_date
  ON link_daily(date DESC);

-- ─── 5. Backfill subs history onto the creator layer ───────────────────────
INSERT INTO creator_daily (creator_id, date, new_subs)
SELECT creator_id, date, SUM(new_subs)::int
  FROM conversion_daily
 WHERE creator_id IS NOT NULL
 GROUP BY creator_id, date
ON CONFLICT (creator_id, date) DO UPDATE
  SET new_subs = EXCLUDED.new_subs, updated_at = now();

-- ─── 6. Backfill sub targets onto the creator layer ────────────────────────
INSERT INTO creator_expectations (creator_id, daily_sub_target)
SELECT creator_id, SUM(daily_sub_target)::int
  FROM conversion_expectations
 WHERE creator_id IS NOT NULL
 GROUP BY creator_id
ON CONFLICT (creator_id) DO UPDATE
  SET daily_sub_target = EXCLUDED.daily_sub_target, updated_at = now();

-- ─── 7. RLS — service role only, same posture as the other admin tables ────
ALTER TABLE creator_daily        ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_expectations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_daily           ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON creator_daily, creator_expectations, tracking_links, link_daily
  FROM anon, authenticated;

COMMIT;
