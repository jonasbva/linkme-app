-- =============================================================================
-- Conversion expectations update — source: Conversion Tracking.xlsx (2026-04-16)
-- =============================================================================
-- Writes daily_sub_target on conversion_expectations, now keyed per
-- conversion_account (so Hailey ENG + ESP, Mila main + second, etc. each
-- get their own row).
--
-- Prereqs:
--   - accounts_refactor_migration.sql must have run (creates conversion_accounts
--     + adds conversion_account_id + flips UNIQUE(conversion_account_id)).
--
-- Safe to re-run. Transaction-wrapped. Idempotent.
-- =============================================================================

BEGIN;

-- ─── 1. Targets per conversion_account (joined via handle) ───────────────────
WITH sheet(handle_ref, daily_sub_target, sheet_name_note) AS (
  VALUES
    -- handle_ref     target  spreadsheet name / note
    -- ── Main accounts ────────────────────────────────────────
    ('zoecarter',       100,  'zoecarter'),
    ('sophieparker',    100,  'sophieparker'),
    ('sophiawest',       50,  'Sophiawest'),
    ('skyecarter',       55,  'skyecarter'),
    ('milahill',         70,  'milahill (main)'),
    ('liilybrown',      230,  'liilybrown (main)'),
    ('jessysanders',    100,  'jessysanders'),
    ('jadeadams',        85,  'jadeadams'),
    ('itsalinaa',         0,  'itsalinaa'),
    ('haileybrown',     400,  'haileybrown ENG (main)'),
    ('emmabaker',        50,  'emmabaker'),
    ('elenaraine',       20,  'elenaraine'),
    ('daisycarter',       0,  'daisycarter'),
    ('chloemiller',     100,  'chloemiller'),
    ('celinewest',      118,  'celinewest'),
    ('annabaileys',     100,  'annabaileys'),
    ('ambermoore',      110,  'ambermoore (main)'),
    ('alicebaker',       60,  'alicebaker (main)'),
    ('daisywilson',     150,  'daisywilson'),
    ('lora',              6,  'Lora'),
    -- Sheet-only orphans (target = 0 per sheet)
    ('marystoone',        0,  'marystoone'),
    ('delinarose',        0,  'delinarose'),
    ('mia',               0,  'mia'),

    -- ── Alt accounts (now storable per-account) ──────────────
    ('haileybroown',     50,  'haileybroown ESP (alt)'),
    ('milaahill',         0,  'milaahill (second)')

    -- NOT in sheet / no value given on Expectations tab:
    --   ambermooree, lilybroown, aliceebaker, anasawyer, ruubichan,
    --   katiefisher, laura, josiediaz
    --   → left without an expectation row. Add below if/when values exist.
)
INSERT INTO conversion_expectations (creator_id, conversion_account_id, daily_sub_target)
SELECT ca.creator_id, ca.id, s.daily_sub_target
  FROM sheet s
  JOIN conversion_accounts ca ON ca.handle = s.handle_ref
ON CONFLICT (conversion_account_id) DO UPDATE
  SET daily_sub_target      = EXCLUDED.daily_sub_target,
      creator_id            = EXCLUDED.creator_id,
      updated_at            = now();

-- ─── 2. Report: which sheet rows didn't match a conversion_account? ──────────
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    WITH sheet(handle_ref, sheet_name_note) AS (
      VALUES
        ('zoecarter','zoecarter'), ('sophieparker','sophieparker'),
        ('sophiawest','Sophiawest'), ('skyecarter','skyecarter'),
        ('milahill','milahill'), ('liilybrown','liilybrown'),
        ('jessysanders','jessysanders'), ('jadeadams','jadeadams'),
        ('itsalinaa','itsalinaa'), ('haileybrown','haileybrown ENG'),
        ('emmabaker','emmabaker'), ('elenaraine','elenaraine'),
        ('daisycarter','daisycarter'), ('chloemiller','chloemiller'),
        ('celinewest','celinewest'), ('annabaileys','annabaileys'),
        ('ambermoore','ambermoore'), ('alicebaker','alicebaker'),
        ('daisywilson','daisywilson'), ('lora','Lora'),
        ('marystoone','marystoone'), ('delinarose','delinarose'),
        ('mia','mia'), ('haileybroown','haileybroown ESP'),
        ('milaahill','milaahill')
    )
    SELECT s.handle_ref, s.sheet_name_note
      FROM sheet s
     WHERE NOT EXISTS (
       SELECT 1 FROM conversion_accounts ca WHERE ca.handle = s.handle_ref
     )
  LOOP
    RAISE NOTICE 'No conversion_account for handle=% (sheet=%)', r.handle_ref, r.sheet_name_note;
  END LOOP;
END $$;

COMMIT;

-- =============================================================================
-- POST-CHECKS — copy/paste into SQL editor after commit.
-- =============================================================================

-- See every conversion account's current expectation:
-- SELECT c.display_name,
--        ca.handle,
--        COALESCE(ca.display_label, 'main') AS label,
--        ce.daily_sub_target,
--        ce.updated_at
--   FROM creators c
--   JOIN conversion_accounts ca ON ca.creator_id = c.id
--   LEFT JOIN conversion_expectations ce ON ce.conversion_account_id = ca.id
--  ORDER BY c.display_name, (ca.display_label IS NOT NULL), ca.handle;

-- Which conversion accounts still have NO expectation row?
-- SELECT c.display_name, ca.handle, ca.display_label
--   FROM conversion_accounts ca
--   JOIN creators c ON c.id = ca.creator_id
--   LEFT JOIN conversion_expectations ce ON ce.conversion_account_id = ca.id
--  WHERE ce.id IS NULL
--  ORDER BY c.display_name, ca.handle;
