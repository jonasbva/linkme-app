-- Revenue Tracking Schema
-- Run this in Supabase SQL Editor to create the tables needed for the Revenue tab

-- ============================================================
-- 1. Infloww API Configuration (admin-only settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.infloww_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  api_key text NOT NULL DEFAULT '',
  agency_oid text NOT NULL DEFAULT '',
  refund_threshold_dollars integer NOT NULL DEFAULT 20,
  fetching_enabled boolean NOT NULL DEFAULT true,
  api_key_updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT infloww_config_pkey PRIMARY KEY (id)
);

-- Only one config row should exist; enforce with a trigger or app logic
-- Insert default row
INSERT INTO public.infloww_config (api_key, agency_oid, refund_threshold_dollars)
SELECT '', '', 20
WHERE NOT EXISTS (SELECT 1 FROM public.infloww_config);

-- RLS: Only super admins can read/write (enforced via service role key in API routes)
ALTER TABLE public.infloww_config ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. Revenue Expectations (per creator)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.revenue_expectations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL UNIQUE,
  daily_revenue_target integer NOT NULL DEFAULT 0,         -- in dollars
  revenue_per_fan_baseline integer NOT NULL DEFAULT 0,     -- 14d baseline, in dollars
  check_frequency integer NOT NULL DEFAULT 1,              -- 1, 3, or 7 days
  free_subs boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT revenue_expectations_pkey PRIMARY KEY (id),
  CONSTRAINT revenue_expectations_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE,
  CONSTRAINT revenue_expectations_check_frequency_check CHECK (check_frequency IN (1, 3, 7))
);

ALTER TABLE public.revenue_expectations ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. Revenue Emergency Status (manual per creator)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.revenue_emergency_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL UNIQUE,
  emergency_since date,                                     -- null = no emergency
  notes text DEFAULT '',
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT revenue_emergency_status_pkey PRIMARY KEY (id),
  CONSTRAINT revenue_emergency_status_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE
);

ALTER TABLE public.revenue_emergency_status ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. Infloww Creator Mapping (maps Infloww creator ID → Supabase creator)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.infloww_creator_map (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL UNIQUE,
  infloww_creator_id text NOT NULL UNIQUE,
  infloww_creator_name text DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT infloww_creator_map_pkey PRIMARY KEY (id),
  CONSTRAINT infloww_creator_map_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE
);

ALTER TABLE public.infloww_creator_map ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 5. Cached Infloww Creators (auto-populated when revenue data is fetched)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.infloww_creators_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  infloww_id text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  user_name text NOT NULL DEFAULT '',
  nick_name text DEFAULT '',
  last_seen_at timestamp with time zone DEFAULT now(),
  CONSTRAINT infloww_creators_cache_pkey PRIMARY KEY (id)
);

ALTER TABLE public.infloww_creators_cache ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_infloww_creators_cache_infloww_id ON public.infloww_creators_cache(infloww_id);
CREATE INDEX IF NOT EXISTS idx_infloww_creator_map_infloww_id ON public.infloww_creator_map(infloww_creator_id);
CREATE INDEX IF NOT EXISTS idx_infloww_creator_map_creator_id ON public.infloww_creator_map(creator_id);
CREATE INDEX IF NOT EXISTS idx_revenue_expectations_creator_id ON public.revenue_expectations(creator_id);
CREATE INDEX IF NOT EXISTS idx_revenue_emergency_status_creator_id ON public.revenue_emergency_status(creator_id);
CREATE INDEX IF NOT EXISTS idx_conversion_daily_creator_date ON public.conversion_daily(creator_id, date);
