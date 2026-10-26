-- =============================================================================
-- Tracking-link discovery + bio links  (APPLIED 2026-10-26)
-- =============================================================================

-- When Infloww says a tracking link was made. /v1/links filters on creation
-- time with a 31-day cap, so knowing this lets the daily sync ask only for the
-- windows that actually contain our links instead of walking back a full year
-- for every creator.
alter table tracking_links
  add column if not exists infloww_created_at timestamptz;

-- The link an account carries in its Instagram bio, as Instagram reports it.
-- Most of these accounts put nothing in the bio and route through a story
-- highlight instead, so NULL is the normal case — and is itself the signal that
-- a visitor has nothing to click. bio_link_checked_at separates "looked, found
-- nothing" from "never looked".
alter table social_accounts
  add column if not exists bio_link            text,
  add column if not exists bio_link_checked_at timestamptz;
