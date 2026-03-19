-- ============================================================
-- LinkMe Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================================

-- Creators table
CREATE TABLE IF NOT EXISTS creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- e.g. "lilybrown" → yourdomain.com/lilybrown
  display_name TEXT NOT NULL,          -- e.g. "Lily Brown"
  username TEXT,                        -- e.g. "lilybrown" (shown as @username)
  bio TEXT,
  avatar_url TEXT,
  background_color TEXT DEFAULT '#080808',
  background_image_url TEXT,
  custom_domain TEXT,                  -- e.g. "lilybrown.com"
  button_style TEXT DEFAULT 'rounded', -- 'rounded' | 'pill' | 'sharp'
  button_color TEXT DEFAULT '#1a1a1a',
  text_color TEXT DEFAULT '#ffffff',
  show_verified BOOLEAN DEFAULT true,
  avatar_position TEXT DEFAULT 'top',
  hero_height TEXT DEFAULT 'large',
  hero_position TEXT DEFAULT '30',     -- hero image vertical crop 0-100
  hero_scale TEXT DEFAULT '100',       -- hero image zoom 100-200
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Links table
CREATE TABLE IF NOT EXISTS links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                 -- e.g. "OnlyFans (free for a short time)"
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',           -- 'onlyfans' | 'fansly' | 'instagram' | 'twitter' | 'tiktok' | 'link'
  thumbnail_url TEXT,                  -- optional preview image shown above the link button
  thumbnail_position TEXT DEFAULT '50', -- vertical crop 0-100 (0=top, 50=center, 100=bottom)
  thumbnail_height INT DEFAULT 200,     -- display height in pixels (100-400)
  custom_icon_url TEXT,                 -- optional custom icon image URL
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clicks / analytics table
CREATE TABLE IF NOT EXISTS clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('page_view', 'link_click')),
  country TEXT,
  country_code TEXT,
  city TEXT,
  device TEXT,                         -- 'mobile' | 'desktop' | 'tablet'
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS clicks_creator_id_idx ON clicks(creator_id);
CREATE INDEX IF NOT EXISTS clicks_link_id_idx ON clicks(link_id);
CREATE INDEX IF NOT EXISTS clicks_created_at_idx ON clicks(created_at);
CREATE INDEX IF NOT EXISTS clicks_type_idx ON clicks(type);

-- Seed example creator: Lily Brown
INSERT INTO creators (slug, display_name, username, bio, show_verified, background_color, button_color, button_style)
VALUES (
  'lilybrown',
  'Lily Brown',
  'lilybrown',
  'my exclusive content 🤤',
  true,
  '#080808',
  '#1a1a1a',
  'rounded'
) ON CONFLICT (slug) DO NOTHING;

-- Seed Lily Brown's links
INSERT INTO links (creator_id, title, url, icon, sort_order)
SELECT id, 'OnlyFans (free for a short time)', 'https://onlyfans.com/lilyybrown/c27', 'onlyfans', 1
FROM creators WHERE slug = 'lilybrown'
ON CONFLICT DO NOTHING;

INSERT INTO links (creator_id, title, url, icon, sort_order)
SELECT id, 'Fansly', 'https://fansly.com/liilybrown/t0', 'fansly', 2
FROM creators WHERE slug = 'lilybrown'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Row Level Security (optional but recommended)
-- ============================================================
-- Allow anyone to read active creators and links (public pages)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active creators" ON creators
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active links" ON links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can insert clicks" ON clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can read clicks" ON clicks
  FOR SELECT USING (true);

-- For admin operations (create/update/delete), use the service_role key
-- which bypasses RLS. Set it as SUPABASE_SERVICE_KEY in your .env.
