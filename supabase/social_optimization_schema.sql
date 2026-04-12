-- ============================================================
-- Social Media Tracking Optimization
-- Run this in Supabase SQL Editor
-- ============================================================

BEGIN;

-- 1. Add scrape_date column for fast date filtering (DATE is much cheaper to index than TIMESTAMPTZ)
ALTER TABLE social_snapshots ADD COLUMN IF NOT EXISTS scrape_date DATE;

-- Backfill scrape_date from existing scraped_at values
UPDATE social_snapshots SET scrape_date = (scraped_at AT TIME ZONE 'UTC')::DATE WHERE scrape_date IS NULL;

-- Make scrape_date default to today for new rows
ALTER TABLE social_snapshots ALTER COLUMN scrape_date SET DEFAULT CURRENT_DATE;

-- 2. Indexes for fast date range queries
-- Primary lookup: "get snapshots for this account between these dates"
CREATE INDEX IF NOT EXISTS idx_social_snapshots_account_date
  ON social_snapshots(social_account_id, scrape_date DESC);

-- Secondary: "get all snapshots on a specific date" (for dashboard aggregation)
CREATE INDEX IF NOT EXISTS idx_social_snapshots_date
  ON social_snapshots(scrape_date DESC);

-- Fast latest-snapshot lookup (used by dashboard page.tsx)
CREATE INDEX IF NOT EXISTS idx_social_snapshots_account_scraped
  ON social_snapshots(social_account_id, scraped_at DESC);

-- 3. Social posts table — tracks individual post performance over time
-- Each row = one post observed during one scrape
-- This lets you see how a post's views/likes grow day by day
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  post_short_code TEXT NOT NULL,           -- Instagram shortCode (unique per post)
  post_type TEXT,                          -- 'Image', 'Video', 'Sidecar'
  caption TEXT,
  display_url TEXT,
  post_timestamp TIMESTAMPTZ,              -- when the post was originally published
  -- Metrics (updated each scrape)
  video_view_count BIGINT DEFAULT 0,
  likes_count BIGINT DEFAULT 0,
  comments_count BIGINT DEFAULT 0,
  -- Tracking
  first_seen_at TIMESTAMPTZ DEFAULT now(), -- when we first scraped this post
  last_seen_at TIMESTAMPTZ DEFAULT now(),  -- last time this post appeared in latestPosts
  last_views BIGINT DEFAULT 0,             -- snapshot of metrics at last scrape
  last_likes BIGINT DEFAULT 0,
  last_comments BIGINT DEFAULT 0,
  UNIQUE(social_account_id, post_short_code)
);

-- Indexes for social_posts
CREATE INDEX IF NOT EXISTS idx_social_posts_account
  ON social_posts(social_account_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_posts_shortcode
  ON social_posts(post_short_code);

-- 4. Social accounts index (for the join from creators)
CREATE INDEX IF NOT EXISTS idx_social_accounts_creator
  ON social_accounts(creator_id, is_active);

-- 5. RLS for new table
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access social_posts" ON social_posts USING (true) WITH CHECK (true);

COMMIT;
