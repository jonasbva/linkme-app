-- =============================================================================
-- Conversion expectations update — source: Conversion Tracking.xlsx (2026-04-16)
-- =============================================================================
-- Writes daily_sub_target on conversion_expectations for every creator that has
-- a value in the Expectations sheet, joined via of_accounts.handle.
--
-- Keyed on creator_id (current UNIQUE constraint). For creators with multiple
-- OF accounts (Hailey ENG+ESP, Mila main+second, Amber main+alt, Lily main),
-- this SQL uses the MAIN account's target. ESP/alt/second values are noted
-- in comments but not stored — add a per-of_account UNIQUE constraint if you
-- want per-account expectations later.
--
-- Safe to re-run. Transaction-wrapped. Idempotent.
-- =============================================================================

BEGIN;

-- ─── 1. Targets per creator (via main of_account handle) ─────────────────────
WITH sheet(handle_ref, daily_sub_target, sheet_name_note) AS (
  VALUES
    -- handle_ref    target  spreadsheet name
    ('zoecaarter',     100,  'zoecarter'),
    ('sophieeparker',  100,  'sophieparker'),
    ('sophiaawest',     50,  'Sophiawest'),
    ('skyeecarter',     55,  'skyecarter'),
    ('milahill',        70,  'milahill (main; milaahill=0 ignored)'),
    ('lilyybrown',     230,  'liilybrown'),
    ('jessysanders',   100,  'jessysanders'),
    ('jadeadamsxoxo',   85,  'jadeadams'),
    ('itsalina',         0,  'itsalinaa'),
    ('haileybroown',   400,  'haileybrown (main/ENG; ESP=50 ignored)'),
    ('emmaabaker',      50,  'emmabaker'),
    ('elenaaraine',     20,  'elenaraine'),
    ('daisycaarter',     0,  'daisycarter'),
    ('chloeemiller',   100,  'chloemiller'),
    ('celineewest',    118,  'celinewest'),
    ('annabaiileys',   100,  'annabaileys'),
    ('ambermoore',     110,  'ambermoore (main; ambermooree alt ignored)'),
    ('alicebaaker',     60,  'alicebaker'),
    ('daisywilson',    150,  'daisywilson'),
    ('lora.cain',        6,  'Lora')
    -- Intentionally skipped:
    --   marystoone, delinarose, mia   — target=0 and no creator in DB
    --   Laura                         — no value on sheet
    --   anasawyer, lilybroown, ruubichan, katiefisher, aliceebaker
    --                                 — tabs only, not in Infloww/migration;
    --                                   confirm before adding to of_accounts.
)
INSERT INTO conversion_expectations (creator_id, of_account_id, daily_sub_target)
SELECT oa.creator_id, oa.id, s.daily_sub_target
  FROM sheet s
  JOIN of_accounts oa ON oa.handle = s.handle_ref
 WHERE oa.display_label IS NULL           -- main account only (one row / creator)
ON CONFLICT (creator_id) DO UPDATE
  SET daily_sub_target = EXCLUDED.daily_sub_target,
      of_account_id    = EXCLUDED.of_account_id,
      updated_at       = now();

-- ─── 2. Report: which sheet rows didn't match an of_account? ─────────────────
-- Raise NOTICE rows so you can see them in Supabase SQL editor output.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    WITH sheet(handle_ref, sheet_name_note) AS (
      VALUES
        ('zoecaarter','zoecarter'), ('sophieeparker','sophieparker'),
        ('sophiaawest','Sophiawest'), ('skyeecarter','skyecarter'),
        ('milahill','milahill'), ('lilyybrown','liilybrown'),
        ('jessysanders','jessysanders'), ('jadeadamsxoxo','jadeadams'),
        ('itsalina','itsalinaa'), ('haileybroown','haileybrown'),
        ('emmaabaker','emmabaker'), ('elenaaraine','elenaraine'),
        ('daisycaarter','daisycarter'), ('chloeemiller','chloemiller'),
        ('celineewest','celinewest'), ('annabaiileys','annabaileys'),
        ('ambermoore','ambermoore'), ('alicebaaker','alicebaker'),
        ('daisywilson','daisywilson'), ('lora.cain','Lora')
    )
    SELECT s.handle_ref, s.sheet_name_note
      FROM sheet s
     WHERE NOT EXISTS (
       SELECT 1 FROM of_accounts oa
        WHERE oa.handle = s.handle_ref AND oa.display_label IS NULL
     )
  LOOP
    RAISE NOTICE 'No main of_account for handle=% (sheet=%)', r.handle_ref, r.sheet_name_note;
  END LOOP;
END $$;

COMMIT;

-- =============================================================================
-- POST-CHECKS — copy/paste into SQL editor after commit.
-- =============================================================================

-- See every creator's current expectation and main handle:
-- SELECT c.display_name, oa.handle, ce.daily_sub_target, ce.updated_at
--   FROM creators c
--   LEFT JOIN of_accounts oa
--     ON oa.creator_id = c.id AND oa.display_label IS NULL
--   LEFT JOIN conversion_expectations ce ON ce.creator_id = c.id
--  ORDER BY ce.daily_sub_target DESC NULLS LAST, c.display_name;

-- Which creators still have NO expectation row? (e.g. Laura, mia, Zoey, Ashley)
-- SELECT c.display_name, c.slug
--   FROM creators c
--   LEFT JOIN conversion_expectations ce ON ce.creator_id = c.id
--  WHERE ce.id IS NULL
--  ORDER BY c.display_name;
