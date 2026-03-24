-- ============================================================
-- Conversion Tracking Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Stores daily sub expectations per creator
CREATE TABLE IF NOT EXISTS conversion_expectations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  daily_sub_target INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id)
);

-- Stores daily conversion data per creator (one row per creator per day)
CREATE TABLE IF NOT EXISTS conversion_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,              -- social media views (from social_snapshots)
  profile_views INT DEFAULT 0,          -- page_view clicks from clicks table
  link_clicks INT DEFAULT 0,            -- link_click clicks from clicks table
  new_subs INT DEFAULT 0,               -- manually entered
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, date)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_conversion_daily_creator ON conversion_daily(creator_id);
CREATE INDEX IF NOT EXISTS idx_conversion_daily_date ON conversion_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_conversion_daily_creator_date ON conversion_daily(creator_id, date DESC);

-- RLS
ALTER TABLE conversion_expectations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access conversion_expectations" ON conversion_expectations USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access conversion_daily" ON conversion_daily USING (true) WITH CHECK (true);
