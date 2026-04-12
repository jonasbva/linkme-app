-- Simple table to track scrape job progress (polling-based, no SSE)
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'running',       -- running | done | error
  total INT NOT NULL DEFAULT 0,
  completed INT NOT NULL DEFAULT 0,
  current_batch INT NOT NULL DEFAULT 0,
  total_batches INT NOT NULL DEFAULT 0,
  success INT NOT NULL DEFAULT 0,
  errors INT NOT NULL DEFAULT 0,
  message TEXT,                                  -- e.g. "Batch 3/6..."
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookup of latest job
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_created ON scrape_jobs (created_at DESC);
