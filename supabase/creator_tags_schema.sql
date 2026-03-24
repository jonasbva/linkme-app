-- ============================================================
-- Creator Tags Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Available tags (reusable across creators)
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',  -- hex color, default blue
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table: which creators have which tags
CREATE TABLE IF NOT EXISTS creator_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_tags_creator ON creator_tags(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_tags_tag ON creator_tags(tag_id);

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access tags" ON tags USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access creator_tags" ON creator_tags USING (true) WITH CHECK (true);
