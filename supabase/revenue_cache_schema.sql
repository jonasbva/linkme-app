-- Revenue Cache Schema
-- Stores the latest fetched revenue data so the dashboard can read it instantly
-- instead of hitting the Infloww API on every page load.

CREATE TABLE IF NOT EXISTS public.revenue_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,            -- e.g. 'today', 'yesterday', 'last7', 'last30'
  data jsonb NOT NULL DEFAULT '{}'::jsonb,   -- full revenue response (totals, creators, etc.)
  fetched_at timestamp with time zone DEFAULT now(),
  CONSTRAINT revenue_cache_pkey PRIMARY KEY (id)
);

ALTER TABLE public.revenue_cache ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_revenue_cache_key ON public.revenue_cache(cache_key);
