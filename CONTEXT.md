# LinkMe / Tracking Admin — Project Context

## Overview
A Next.js 14 (App Router, TypeScript) admin app for an adult-content creator agency. The product **focus has shifted**: it is now primarily a **tracking dashboard for the traffic team** —

1. **Social media tracking** (Instagram follower/engagement snapshots, per-post analytics)
2. **Revenue tracking** (live Infloww OnlyFans revenue, per-creator + agency totals)
3. **Subscriber / conversion tracking** (per-account daily funnel: views → profile views → link clicks → new subs, vs. targets)

The original **LinkMe link-in-bio** feature (public creator pages, links, custom domains, themes) is still present but **optional/secondary** — re-enableable per creator via the `linkme_enabled` flag.

- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (Postgres), Vercel, lucide-react, recharts
- **Hosting:** Vercel · **DB:** Supabase

---

## Navigation (left sidebar)
Navigation is a **left sidebar** (`components/admin/Sidebar.tsx`, `w-60`), rendered by `app/admin/layout.tsx` as a flex shell (fixed sidebar + scrollable main). Active items use a **solid blue pill**.

- **Creator switcher** (top, CreatorHero-style): a card showing the active creator (avatar + name + chevrons); clicking opens a searchable popover of all creators. Selecting one persists `activeCreatorId` (localStorage) and navigates to that creator's Social Media page. On first load the active creator defaults to the route's creator → last selected → the first creator, so the creator tabs are always populated.
- **Creator** group — the active creator's tabs (always visible): Social Media (`/analysis`), Conversions (`/conversions?creator=`), LinkMe (`/edit`), Settings (super-admin). Filtered by per-creator permission (layout passes a serialized `userPermissions` snapshot; the sidebar fetches `/api/admin/creators` once, module-cached, to resolve creators).
- **Workspace** group — Overview (`/admin`), All Creators (`/admin/creators`), Revenue, Social Accounts (super-admin), Domains.
- **Admin** group (super-admin only) — Access (`/admin/access` — manage users, roles, and per-creator permissions; this is where access is granted).

Bottom: theme toggle, the signed-in user's name (links to **`/admin/profile`**), and logout. Mobile uses a hamburger + off-canvas drawer.

> Note: super-admin nav visibility reads the signed session token, so a user promoted to super-admin must **log out and back in** for super-admin items to appear (the API guards re-check the DB immediately regardless).

## Pages
- **`/admin` — Overview** (`DashboardClient`): KPI cards (followers, engagement, new subs, revenue-today-from-cache — no live Infloww fetch), a **Needs attention** panel (revenue emergencies, accounts below sub target today, unmapped Infloww, stale scrapes), and Quick actions. Data: `getOverviewData` in `lib/dashboard-data.ts`.
- **`/admin/creators` — Creators list** (`CreatorsClient`): the searchable/sortable creator list (moved off the dashboard). Data: `getCreatorStats` in `lib/dashboard-data.ts`.
- **`/admin/profile` — Profile** (`ProfileClient` + `app/api/admin/profile/route.ts`): self-service change own display name + password (`requireUser`, self only; re-issues the signed cookie on name change).

## Loading / responsiveness
Every slow segment has a `loading.tsx` rendering `<PageLoader/>` (from `components/admin/ui.tsx`) so a spinner appears **instantly** on navigation. Shared primitives in `components/admin/ui.tsx`: `Spinner`, `Skeleton`, `PageLoader`, `Card`, `Button`, `ButtonLink`, `SectionHeader`.

---

## Auth (IMPORTANT — changed)
Custom email/password auth backed by the `admin_users` table (NOT Supabase Auth).

- **Session cookie:** `admin_session`, an **HMAC-SHA256-signed** token (`lib/auth.ts`) — `<base64url(payload)>.<base64url(sig)>`. The payload (incl. `is_super_admin`) cannot be forged. Signing secret: `SESSION_SECRET` (falls back to `SUPABASE_SERVICE_ROLE_KEY`).
- **The legacy unsigned token and the `admin_auth=true` cookie are gone.** Revenue routes/page previously gated on `admin_auth` (which login never set) — that was both broken and forgeable; all now use the guards below.
- **Guards (`lib/auth.ts`):**
  - `requireUser()` — any logged-in admin.
  - `requireSuperAdmin()` — re-validates `is_super_admin`/`is_active` against the DB (defeats stale tokens). Used for user/role management, Infloww config, creator create/delete, bulk social-account ops, global scrape/recompute.
  - `requireCreatorAccess(creatorId, permission?)` — per-creator permission via `getUserPermissions` (super-admins bypass). Used on all creator-scoped routes.
  - `childBelongsToCreator(table, childId, creatorId)` — closes IDOR on nested resources (links, conversion accounts).
  - `verifyCronSecret(req)` — cron routes fail **closed** if `CRON_SECRET` is unset.
- **Rate limiting:** login is limited per-IP and per-email via `lib/rate-limit.ts` (Upstash; no-op without Upstash env vars).

Permission types: `view_links · view_social · view_conversions · view_link_analytics · edit_settings · edit_links · input_conversions · edit_social`, granted per-creator to users or roles (`getUserPermissions`). List reads (dashboard, creators, conversions, social accounts) are scoped to the user's visible creators.

---

## Required environment variables
See `.env.example`. Notable:
- `SUPABASE_SERVICE_ROLE_KEY` — server-side DB access (the app uses this for all DB access; the anon key is not used for DB reads).
- `SESSION_SECRET` — session signing (set explicitly in prod).
- `CRON_SECRET` — **required** for `/api/cron/*` (Vercel Cron sends it as a bearer; routes reject everything if unset).
- `UPSTASH_REDIS_REST_URL` / `_TOKEN` — rate limiting (else limiters are no-ops).

---

## Database (Supabase)
Service-role server-side everywhere; **anon key is not used for DB access**. RLS hardening + an `of_handle` unique constraint are shipped as reviewed SQL in `supabase/` (apply manually):
- `supabase/security_rls_hardening_2026-06-05.sql` — locks anon/authenticated out of all sensitive tables (admin/infloww/revenue/conversion/social/tags), enables RLS on `scrape_jobs` + `conversion_accounts`, keeps only active `creators`/`links` publicly readable.
- `supabase/of_handle_unique_2026-06-05.sql` — case-insensitive unique `creators.of_handle`.

Key tables:
- **creators** — hub. `of_handle` (Infloww mapping key, unique), `linkme_enabled`, plus LinkMe page styling columns.
- **social_accounts → social_snapshots / social_posts** — IG accounts, daily metric snapshots, per-post analytics.
- **conversion_accounts → conversion_daily / conversion_expectations** — N accounts per creator; daily funnel rows + per-account daily sub target.
- **revenue_expectations / revenue_emergency_status / revenue_cache** + **infloww_config / infloww_creator_map / infloww_creators_cache** — Infloww revenue integration & caching.
- **admin_users / admin_roles / admin_user_roles / admin_permissions / admin_creator_access** — RBAC.
- **tags / creator_tags**, **scrape_jobs** (async scrape progress).
- **links / clicks** — LEGACY LinkMe (kept; optional).

---

## Revenue cache
`lib/revenue-cache.ts` holds the shared in-process rebuild (`rebuildRevenueCache(fromMs, toMs)`, `resolveRevenueRange`). Both the cron route (`/api/cron/revenue-cache`) and the admin cache route (`/api/admin/revenue/cache`) call it directly — no internal HTTP self-call or shared-secret coupling. Cache keys: `live:<from>-<bucketedTo>` (≤2 min from now), `rng:<from>-<to>`, plus legacy `today` / `YYYY-MM-DD`. Cleanup cron prunes `live:*` >24h and `rng:*` >90d.

---

## Image proxy (SSRF-guarded)
`/api/admin/proxy-image?url=` — admin-only; only fetches `*.cdninstagram.com` / `*.fbcdn.net` over https, blocks private/loopback/link-local/metadata IPs, no redirects, image content-type + size capped. Used by `SocialTab`. `lib/ssrf.ts` holds the guard (also applied to `check-domain`).

---

## File structure (relevant)
```
app/admin/                layout.tsx (sidebar shell), page.tsx (dashboard),
  conversions/ revenue/ social-accounts/ domains/ access/ creators/[id]/{edit,analysis,links,settings}
app/api/admin/...         all guarded per lib/auth (see Auth)
app/api/cron/...          CRON_SECRET-gated (fail closed)
components/admin/         Sidebar, ThemeProvider, DashboardClient, ConversionsClient, RevenueClient,
                          SocialAccountsClient, SettingsClient, CreatorEditor, LinksManager, DomainsManager, ...
components/CreatorPage.tsx public LinkMe page
lib/                       auth.ts, supabase.ts, rate-limit.ts, ssrf.ts, revenue-cache.ts, scraper.ts
supabase/                  schema + migrations + the two hardening SQL files above
```

---

## Build notes
- `next.config.js` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` (true). A few **pre-existing** type errors remain (RevenueClient casts, `CreatorPage` `lock_*` fields not on the `Creator` type) — they don't block the SWC build. `tsconfig.json` now sets `target: es2017`.
- Tests: `npm test` (vitest) — auth/login/creators/redirect/track/rate-limit covered.
