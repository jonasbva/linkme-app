-- Migration: Add fetching_enabled toggle to infloww_config
-- Run this in the Supabase SQL Editor

ALTER TABLE public.infloww_config
ADD COLUMN IF NOT EXISTS fetching_enabled boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.infloww_config.fetching_enabled
IS 'When false, all Infloww API fetching (live data + cron cache refresh) is disabled.';
