-- ============================================================================
-- Enforce a unique OnlyFans handle per creator (2026-06-05)
--
-- creators.of_handle is the primary mapping key to Infloww. Two creators
-- sharing a handle breaks revenue attribution. The API normalizes the handle
-- to lowercase and pre-checks uniqueness, but this constraint guarantees it at
-- the database level. NULLs (no handle set) are ignored.
--
-- Safe to run multiple times.
-- ============================================================================

create unique index if not exists creators_of_handle_unique
  on public.creators (lower(of_handle))
  where of_handle is not null;
