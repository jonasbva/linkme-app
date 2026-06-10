-- ============================================================
-- Collapse second accounts + fix Lily Brown conversion data
-- ============================================================
-- Why:
--   • We no longer want separate creator rows for "second" accounts.
--   • The previous upload sent Lily's Excel data to the (now-doomed)
--     creator `liilybrown-second-acc`, so `lilybrown` in the app still
--     shows old/wrong numbers. This script fixes that.
--
-- What it does (one transaction, safe to re-run):
--   1) Deletes 3 creator rows: liilybrown-second-acc, milaahill-second-acc,
--      haileybroown_esp. ON DELETE CASCADE on conversion_daily,
--      conversion_expectations, links, clicks removes their data.
--   2) Upserts Lily Brown's daily_sub_target (230) onto `lilybrown`.
--   3) Upserts March 1–31 2026 conversion_daily for `lilybrown` using
--      the Excel "liilybrown" sheet values (Views / Profile Views /
--      Link Clicks / Subs).
--
-- Note: the Excel "milaahill" and "haileybroown ESP" sheets no longer
-- have a mapping target and their data is discarded, per your instruction.
-- ============================================================

-- ─── 0) Preflight (optional — read-only; safe to run first) ──
-- Uncomment to preview what will be deleted before committing:
--
-- SELECT 'to_delete' AS bucket, c.slug, c.display_name,
--        (SELECT count(*) FROM conversion_daily WHERE creator_id = c.id) AS daily_rows,
--        (SELECT count(*) FROM conversion_expectations WHERE creator_id = c.id) AS exp_rows,
--        (SELECT count(*) FROM links WHERE creator_id = c.id) AS link_rows,
--        (SELECT count(*) FROM clicks WHERE creator_id = c.id) AS click_rows
-- FROM creators c
-- WHERE c.slug IN ('liilybrown-second-acc', 'milaahill-second-acc', 'haileybroown_esp');

BEGIN;

-- ─── 1) Delete the 3 second-account creator rows ──────────────
DELETE FROM creators
WHERE slug IN (
  'liilybrown-second-acc',
  'milaahill-second-acc',
  'haileybroown_esp'
);

-- ─── 2) Expectations: set Lily Brown target to 230 ────────────
INSERT INTO conversion_expectations (creator_id, daily_sub_target, updated_at)
SELECT c.id, 230, now()
FROM creators c
WHERE c.slug = 'lilybrown'
ON CONFLICT (creator_id) DO UPDATE
  SET daily_sub_target = EXCLUDED.daily_sub_target,
      updated_at       = now();

-- ─── 3) Fix March 2026 daily data for lilybrown ──────────────
-- Same values as the "liilybrown" sheet; just routed to the correct creator.
INSERT INTO conversion_daily (creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
SELECT c.id, v.date::date, v.views, v.profile_views, v.link_clicks, v.new_subs, now()
FROM (VALUES
  ('lilybrown', '2026-03-01', 0, 61, 30, 111),
  ('lilybrown', '2026-03-02', 0, 39, 23, 108),
  ('lilybrown', '2026-03-03', 0, 57, 34, 111),
  ('lilybrown', '2026-03-04', 0, 46, 16, 104),
  ('lilybrown', '2026-03-05', 0, 44, 20, 97),
  ('lilybrown', '2026-03-06', 0, 49, 11, 135),
  ('lilybrown', '2026-03-07', 0, 69, 26, 131),
  ('lilybrown', '2026-03-08', 0, 46, 20, 120),
  ('lilybrown', '2026-03-09', 0, 54, 32, 200),
  ('lilybrown', '2026-03-10', 0, 48, 22, 181),
  ('lilybrown', '2026-03-11', 0, 67, 31, 131),
  ('lilybrown', '2026-03-12', 0, 75, 33, 124),
  ('lilybrown', '2026-03-13', 0, 91, 44, 107),
  ('lilybrown', '2026-03-14', 0, 89, 41, 142),
  ('lilybrown', '2026-03-15', 103718, 1018, 482, 160),
  ('lilybrown', '2026-03-16', 139426, 630, 220, 132),
  ('lilybrown', '2026-03-17', 177079, 839, 311, 127),
  ('lilybrown', '2026-03-18', 14117, 807, 298, 150),
  ('lilybrown', '2026-03-19', 351257, 1052, 405, 166),
  ('lilybrown', '2026-03-20', 178426, 906, 313, 148),
  ('lilybrown', '2026-03-21', 180406, 1190, 377, 154),
  ('lilybrown', '2026-03-22', 165214, 848, 260, 155),
  ('lilybrown', '2026-03-23', 183408, 1211, 364, 156),
  ('lilybrown', '2026-03-24', 140627, 829, 275, 192),
  ('lilybrown', '2026-03-25', 141502, 728, 242, 141),
  ('lilybrown', '2026-03-26', 183391, 936, 279, 155),
  ('lilybrown', '2026-03-27', 126041, 712, 214, 118),
  ('lilybrown', '2026-03-28', 163404, 963, 289, 147),
  ('lilybrown', '2026-03-29', 261815, 1726, 539, 226),
  ('lilybrown', '2026-03-30', 334283, 3430, 1013, 324),
  ('lilybrown', '2026-03-31', 391717, 5143, 1578, 452)
) AS v(slug, date, views, profile_views, link_clicks, new_subs)
JOIN creators c ON c.slug = v.slug
ON CONFLICT (creator_id, date) DO UPDATE
  SET views         = EXCLUDED.views,
      profile_views = EXCLUDED.profile_views,
      link_clicks   = EXCLUDED.link_clicks,
      new_subs      = EXCLUDED.new_subs,
      updated_at    = now();

COMMIT;

-- ─── Post-check ──────────────────────────────────────────────
-- SELECT c.slug, d.date, d.views, d.profile_views, d.link_clicks, d.new_subs
-- FROM conversion_daily d
-- JOIN creators c ON c.id = d.creator_id
-- WHERE c.slug = 'lilybrown'
--   AND d.date BETWEEN '2026-03-01' AND '2026-03-31'
-- ORDER BY d.date;
