-- Revenue Cache Schema
-- Stores the latest fetched revenue data so the dashboard can read it instantly
-- instead of hitting the Infloww API on every page load.
--
-- Cache key formats:
--   'live:<fromMs>-<toBucketedMs>'  — arbitrary range whose end is within 2 min
--                                     of "now"; toBucketedMs is floored to the
--                                     nearest minute so the key is stable ≥60s.
--   'rng:<fromMs>-<toMs>'           — historical range (immutable).
--   'today'                         — legacy alias for today 00:00 → now.
--   'YYYY-MM-DD'                    — legacy alias for a single local day.
--
-- The cleanup cron (app/api/cron/revenue-cache-cleanup) prunes
-- live:* rows >24h old and rng:* rows >90 days old.

CREATE TABLE IF NOT EXISTS public.revenue_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_at timestamp with time zone DEFAULT now(),
  CONSTRAINT revenue_cache_pkey PRIMARY KEY (id)
);

ALTER TABLE public.revenue_cache ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_revenue_cache_key ON public.revenue_cache(cache_key);
-- Speeds up the cleanup sweeps which scan (cache_key LIKE 'live:%'/'rng:%') + fetched_at.
CREATE INDEX IF NOT EXISTS idx_revenue_cache_fetched_at ON public.revenue_cache(fetched_at);
