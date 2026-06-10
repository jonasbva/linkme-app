-- =============================================================================
-- Creator refactor — Phase 1 migration (REVISED)
-- =============================================================================
-- Data model:
--   ONE creator  ──  ONE OF handle   (creators.of_handle, matches Infloww @)
--   ONE creator  ──  N conversion accounts  (one per conversion sheet tab)
--   ONE creator  ──  N social accounts      (IG/TikTok, pre-existing)
--
-- What this does:
--   1. Adds linkme_enabled + of_handle to creators
--   2. Creates `conversion_accounts` table (N per creator)
--   3. Creates placeholder creators for sheet-only orphans
--   4. Sets Ashley's linkme_enabled = true
--   5. Writes every creator's of_handle (Infloww @)
--   6. Upserts every conversion-sheet tab as a conversion_account
--   7. Adds conversion_account_id to conversion_daily + conversion_expectations
--   8. Backfills conversion_account_id to each creator's MAIN conversion account
--   9. Flips uniqueness so expectations + daily are keyed per conversion account
--
-- PREREQUISITE: conversion_tracking_collapse_second_accounts.sql must be run
-- first (collapses duplicate "second-acc" creator rows into their parent).
-- =============================================================================

BEGIN;

-- ─── 0. Preflight: core creator slugs must exist ────────────────────────────
DO $$
DECLARE
  missing_slugs text;
BEGIN
  SELECT string_agg(slug, ', ')
    INTO missing_slugs
    FROM (VALUES
      ('ambermoore'), ('haileybrown'), ('milahill'), ('daisycarter'),
      ('daisywilson'), ('jadeadams'), ('elenaraine'), ('zoecarter'),
      ('skyecarter'), ('jessysanders'), ('sophieparker'), ('emmabaker'),
      ('sophiawest'), ('annabaileys'), ('celinewest'), ('chloemiller'),
      ('alicebaker'), ('lilybrown'), ('itsalinaa')
    ) AS s(slug)
   WHERE NOT EXISTS (SELECT 1 FROM creators c WHERE c.slug = s.slug);

  IF missing_slugs IS NOT NULL THEN
    RAISE EXCEPTION 'Missing creator slugs: %. Aborting.', missing_slugs;
  END IF;
END $$;

-- ─── 1. Creators: linkme_enabled + of_handle ────────────────────────────────
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS linkme_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS of_handle      text;

-- Drop + recreate uniqueness so re-runs stay idempotent
DO $$ BEGIN
  ALTER TABLE creators DROP CONSTRAINT IF EXISTS creators_of_handle_key;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS creators_of_handle_unique
  ON creators(of_handle) WHERE of_handle IS NOT NULL;

-- ─── 2. conversion_accounts table ───────────────────────────────────────────
-- If an older of_accounts table exists from a prior draft, drop it — we never
-- ran that migration, so no data is lost.
DROP TABLE IF EXISTS of_accounts CASCADE;

CREATE TABLE IF NOT EXISTS conversion_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  handle          text UNIQUE NOT NULL,     -- as it appears in the conversion sheet / tab name
  display_label   text,                     -- NULL = main; else "alt" | "ESP" | "second" | ...
  sheet_tab_name  text,                     -- raw sheet tab for import (may equal handle)
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_accounts_creator_id
  ON conversion_accounts(creator_id);

-- ─── 3. New creators ────────────────────────────────────────────────────────
-- Original 6 (Infloww-mapped) + 6 sheet-only orphans.
INSERT INTO creators (display_name, slug, is_active)
VALUES
  -- Infloww creators that weren't in DB yet
  ('Lana',         'lana',          true),
  ('Laura Lehman', 'laura-lehman',  true),
  ('Lora Cain',    'lora-cain',     true),
  ('Zoey',         'zoey',          true),
  ('Josie Diaz',   'josie-diaz',    true),
  ('Ashley',       'ashley',        true),
  -- Orphans present in the Conversion Tracking sheet but NOT on Infloww
  ('Mary Stone',   'marystoone',    true),
  ('Delina Rose',  'delinarose',    true),
  ('Mia',          'mia',           true),
  ('Ana Sawyer',   'anasawyer',     true),
  ('Ruubichan',    'ruubichan',     true),
  ('Katie Fisher', 'katiefisher',   true)
ON CONFLICT (slug) DO NOTHING;

-- ─── 4. LinkMe enabled for Ashley only ──────────────────────────────────────
UPDATE creators SET linkme_enabled = true WHERE slug = 'ashley';

-- ─── 5. Set of_handle on each creator (the authoritative Infloww @) ────────
-- One OF handle per creator. Sheet-only orphans have no Infloww account yet —
-- their of_handle stays NULL (you can set it later on the Settings page).
WITH h(slug, of_handle) AS (VALUES
  ('ambermoore',   'ambermoore'),
  ('haileybrown',  'haileybroown'),
  ('milahill',     'milahill'),
  ('daisycarter',  'daisycaarter'),
  ('daisywilson',  'daisywilson'),
  ('jadeadams',    'jadeadamsxoxo'),
  ('elenaraine',   'elenaaraine'),
  ('zoecarter',    'zoecaarter'),
  ('skyecarter',   'skyeecarter'),
  ('jessysanders', 'jessysanders'),
  ('sophieparker', 'sophieeparker'),
  ('emmabaker',    'emmaabaker'),
  ('sophiawest',   'sophiaawest'),
  ('annabaileys',  'annabaiileys'),
  ('celinewest',   'celineewest'),
  ('chloemiller',  'chloeemiller'),
  ('alicebaker',   'alicebaaker'),
  ('lilybrown',    'lilyybrown'),
  ('itsalinaa',    'itsalina'),
  ('lana',         'lanatass'),
  ('laura-lehman', 'laura_lehman'),
  ('lora-cain',    'lora.cain'),
  ('zoey',         'r6zoey'),
  ('josie-diaz',   'josiediaz'),
  ('ashley',       'itsaashley')
)
UPDATE creators c SET of_handle = h.of_handle
  FROM h WHERE c.slug = h.slug;

-- ─── 6. Upsert every sheet tab into conversion_accounts ────────────────────
-- One row per tab. Main (display_label IS NULL) is what daily/expectations
-- backfill + the Settings "main" badge will pick.
WITH rows(creator_slug, handle, display_label, sheet_tab_name) AS (VALUES
  -- ── Main conversion accounts (display_label = NULL) ──────────
  ('ambermoore',   'ambermoore',    NULL,     'ambermoore'),
  ('haileybrown',  'haileybrown',   NULL,     'haileybrown ENG'),
  ('milahill',     'milahill',      NULL,     'Milahill'),
  ('daisycarter',  'daisycarter',   NULL,     'daisycarter'),
  ('daisywilson',  'daisywilson',   NULL,     'daisywilson'),
  ('jadeadams',    'jadeadams',     NULL,     'jadeadams'),
  ('elenaraine',   'elenaraine',    NULL,     'elenaraine'),
  ('zoecarter',    'zoecarter',     NULL,     'zoecarter'),
  ('skyecarter',   'skyecarter',    NULL,     'skyecarter'),
  ('jessysanders', 'jessysanders',  NULL,     'jessysanders'),
  ('sophieparker', 'sophieparker',  NULL,     'sophieparker'),
  ('emmabaker',    'emmabaker',     NULL,     'emmabaker'),
  ('sophiawest',   'sophiawest',    NULL,     'Sophiawest'),
  ('annabaileys',  'annabaileys',   NULL,     'annabaileys'),
  ('celinewest',   'celinewest',    NULL,     'celinewest'),
  ('chloemiller',  'chloemiller',   NULL,     'chloemiller'),
  ('alicebaker',   'alicebaker',    NULL,     'alicebaker'),
  ('lilybrown',    'liilybrown',    NULL,     'liilybrown'),
  ('itsalinaa',    'itsalinaa',     NULL,     'itsalinaa'),
  ('lora-cain',    'lora',          NULL,     'Lora'),
  ('laura-lehman', 'laura',         NULL,     'Laura'),
  ('josie-diaz',   'josiediaz',     NULL,     'josiediaz'),
  ('marystoone',   'marystoone',    NULL,     NULL),
  ('delinarose',   'delinarose',    NULL,     'delinarose'),
  ('mia',          'mia',           NULL,     'mia'),
  ('anasawyer',    'anasawyer',     NULL,     'anasawyer'),
  ('ruubichan',    'ruubichan',     NULL,     'ruubichan'),
  ('katiefisher',  'katiefisher',   NULL,     'katiefisher'),

  -- ── Alt conversion accounts (display_label set) ──────────────
  ('ambermoore',   'ambermooree',   'alt',    'ambermooree'),
  ('haileybrown',  'haileybroown',  'ESP',    'haileybroown ESP'),
  ('milahill',     'milaahill',     'second', 'milaahill'),
  ('lilybrown',    'lilybroown',    'alt',    'lilybroown'),
  ('alicebaker',   'aliceebaker',   'alt',    'aliceebaker')
)
INSERT INTO conversion_accounts (creator_id, handle, display_label, sheet_tab_name)
SELECT c.id, r.handle, r.display_label, r.sheet_tab_name
  FROM rows r
  JOIN creators c ON c.slug = r.creator_slug
ON CONFLICT (handle) DO UPDATE
  SET creator_id     = EXCLUDED.creator_id,
      display_label  = EXCLUDED.display_label,
      sheet_tab_name = EXCLUDED.sheet_tab_name,
      updated_at     = now();

-- ─── 7. conversion_account_id on conversion_daily + expectations ───────────
ALTER TABLE conversion_daily
  ADD COLUMN IF NOT EXISTS conversion_account_id uuid
  REFERENCES conversion_accounts(id) ON DELETE CASCADE;

ALTER TABLE conversion_expectations
  ADD COLUMN IF NOT EXISTS conversion_account_id uuid
  REFERENCES conversion_accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_conversion_daily_conv_account_id
  ON conversion_daily(conversion_account_id);
CREATE INDEX IF NOT EXISTS idx_conversion_expectations_conv_account_id
  ON conversion_expectations(conversion_account_id);

-- ─── 8. Backfill conversion_account_id to each creator's MAIN account ──────
WITH main_account AS (
  SELECT DISTINCT ON (creator_id)
         creator_id, id AS account_id
    FROM conversion_accounts
   ORDER BY creator_id,
            (display_label IS NOT NULL),   -- NULL (main) first
            handle ASC
)
UPDATE conversion_daily dc
   SET conversion_account_id = ma.account_id
  FROM main_account ma
 WHERE dc.creator_id = ma.creator_id
   AND dc.conversion_account_id IS NULL;

WITH main_account AS (
  SELECT DISTINCT ON (creator_id)
         creator_id, id AS account_id
    FROM conversion_accounts
   ORDER BY creator_id,
            (display_label IS NOT NULL),
            handle ASC
)
UPDATE conversion_expectations ce
   SET conversion_account_id = ma.account_id
  FROM main_account ma
 WHERE ce.creator_id = ma.creator_id
   AND ce.conversion_account_id IS NULL;

-- ─── 9. Make per-account uniqueness the source of truth ────────────────────
-- Expectations: one row per conversion account.
DO $$ BEGIN
  ALTER TABLE conversion_expectations DROP CONSTRAINT IF EXISTS conversion_expectations_creator_id_key;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS conversion_expectations_account_unique
  ON conversion_expectations(conversion_account_id)
  WHERE conversion_account_id IS NOT NULL;

-- Daily: one row per conversion account per date.
DO $$ BEGIN
  ALTER TABLE conversion_daily DROP CONSTRAINT IF EXISTS conversion_daily_creator_id_date_key;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS conversion_daily_account_date_unique
  ON conversion_daily(conversion_account_id, date)
  WHERE conversion_account_id IS NOT NULL;

COMMIT;

-- =============================================================================
-- POST-CHECKS — copy/paste into SQL editor after commit.
-- =============================================================================

-- Full per-creator overview
-- SELECT c.display_name, c.slug, c.of_handle, c.linkme_enabled,
--        count(ca.id) AS conv_accounts,
--        array_agg(ca.handle ORDER BY (ca.display_label IS NOT NULL), ca.handle) AS conv_handles
--   FROM creators c
--   LEFT JOIN conversion_accounts ca ON ca.creator_id = c.id
--  GROUP BY c.id
--  ORDER BY c.display_name;

-- Any conversion_daily rows without a conversion_account_id? (should be none)
-- SELECT count(*) FROM conversion_daily WHERE conversion_account_id IS NULL;
