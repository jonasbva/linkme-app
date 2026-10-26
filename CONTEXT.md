# MAHO Tracking — Project Context

## Overview
A Next.js 14 (App Router, TypeScript) admin app for an adult-content creator agency. It is a **tracking dashboard for the traffic team** —

1. **Social media tracking** (Instagram follower/engagement snapshots, per-post analytics)
2. **Revenue tracking** (live Infloww OnlyFans revenue, per-creator + agency totals)
3. **Conversion tracking** (two layers — see below)

The **LinkMe link-in-bio** feature was **removed on 2026-10-26**: public creator pages, the page/theme editor, custom domains, short-link routing and the built-in click tracker are all gone. "Links" now means a **tracking link** — the URL in an IG bio whose daily traffic the team types in by hand.

### Conversion model (two layers)
```
creator  (= the OF account every IG link funnels into)
  ├── creator_daily         one row per creator per day — new_subs      (hand-entered)
  ├── creator_expectations  one row per creator        — daily_sub_target
  └── tracking_links        N links (one per IG bio link)
        ├── link_daily      one row per link per day
        │                     views / profile_views / link_clicks        (hand-entered)
        │                     infloww_clicks / infloww_new_subs /
        │                     infloww_earnings_net_cents                 (from Infloww)
        └── infloww_link_snapshots   cumulative Infloww counters, one row per link per day
```
Subscribers are counted **per creator** because every IG account's link funnels into the same OF account. Traffic is counted **per link**. Rows are generated for every creator/link so the team only types numbers.

Migration `supabase/creator_link_layers_2026-10-26.sql` created these tables and backfilled `creator_daily` from `conversion_daily.new_subs` (summed per creator per day — 763,560 subs, 2025-10-16 → 2026-10-25). `conversion_daily` / `conversion_accounts` / `conversion_expectations` are **legacy, read-only** and no longer written. `link_daily` started empty by design.

> **Back-compat shim:** the subscriber MCP (`/api/subscribers`) and the management MCP (`lib/conversion-dataset.ts`) still speak the old per-account shape, so both project each creator as a single synthetic account whose id **is** the creator id (`conversion_account_id === creator_id`). Those MCP servers did not need redeploying.

- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (Postgres), Vercel, lucide-react, recharts
- **Hosting:** Vercel · **DB:** Supabase

---

## Navigation (left sidebar)
Navigation is a **left sidebar** (`components/admin/Sidebar.tsx`, `w-60`), rendered by `app/admin/layout.tsx` as a flex shell (fixed sidebar + scrollable main). Active items use a **solid blue pill**.

- **Creator switcher** (top, CreatorHero-style): a card showing the active creator (avatar + name + chevrons); clicking opens a searchable popover of all creators. Selecting one persists `activeCreatorId` (localStorage) and navigates to that creator's Social Media page. On first load the active creator defaults to the route's creator → last selected → the first creator, so the creator tabs are always populated.
- **Creator** group — the active creator's tabs (always visible): Social Media (`/analysis`), Conversions (`/conversions?creator=`), Links (`/links` — manage tracking links), Settings (super-admin). Filtered by per-creator permission (layout passes a serialized `userPermissions` snapshot; the sidebar fetches `/api/admin/creators` once, module-cached, to resolve creators).
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

Permission types: `view_social · view_conversions · edit_settings · input_conversions · edit_social` (the three link-page permissions went with LinkMe), granted per-creator to users or roles (`getUserPermissions`). List reads (dashboard, creators, conversions, social accounts) are scoped to the user's visible creators.

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
- **creators** — hub. `of_handle` (Infloww mapping key, unique). The LinkMe styling columns and `linkme_enabled` are now unused.
- **social_accounts → social_snapshots / social_posts** — IG accounts, daily metric snapshots, per-post analytics. `social_posts.is_trial` flags a post as a Trial on the Social page. `social_accounts.profile_pic_url` holds the cached avatar (see below).
- **creator_daily / creator_expectations** — per-creator daily subs + target (the live conversion tables).
- **tracking_links → link_daily** — per-creator IG bio links + their daily traffic. `infloww_link_id` binds a link to its Infloww counterpart (unique where set); `infloww_link_name` / `infloww_code` / `infloww_synced_at` cache what Infloww last reported.
- **infloww_link_snapshots** — cumulative clicks/subs/earnings per tracking link, snapshotted daily (see Tracking links).
- **conversion_accounts / conversion_daily / conversion_expectations** — LEGACY, read-only.
- **revenue_expectations / revenue_emergency_status / revenue_cache** + **infloww_config / infloww_creator_map / infloww_creators_cache** — Infloww revenue integration & caching.
- **admin_users / admin_roles / admin_user_roles / admin_permissions / admin_creator_access** — RBAC.
- **tags / creator_tags**, **scrape_jobs** (async scrape progress).
- **links / clicks** — LEGACY LinkMe. Nothing reads or writes them; safe to drop once the history is no longer wanted.

---

## Revenue cache
`lib/revenue-cache.ts` holds the shared in-process rebuild (`rebuildRevenueCache(fromMs, toMs)`, `resolveRevenueRange`). Both the cron route (`/api/cron/revenue-cache`) and the admin cache route (`/api/admin/revenue/cache`) call it directly — no internal HTTP self-call or shared-secret coupling. Cache keys: `live:<from>-<bucketedTo>` (≤2 min from now), `rng:<from>-<to>`, plus legacy `today` / `YYYY-MM-DD`. Cleanup cron prunes `live:*` >24h and `rng:*` >90d.

---

## Scraping (how it runs)
`/api/cron/daily-scrape` (Vercel Cron, **every 4 hours**, `CRON_SECRET`-gated) pulls active Instagram accounts via Apify's `instagram-profile-scraper`, writing a `social_snapshots` row, the account's posts, and the cached avatar.

It processes the **stalest accounts first** (no snapshot at all, then longest since last snapshot), up to `MAX_ACCOUNTS_PER_RUN` (45) and within a 4-minute budget, then returns `{attempted, remaining}`. Anything left over is picked up by the next run, so a roster larger than one invocation can handle still gets covered.

Three things previously stopped it working, all fixed 2026-10-26:
- the route had **no `maxDuration`**, so it inherited Vercel's default few seconds and was killed after one or two accounts (`maxDuration = 300` now);
- posts were upserted **one round trip per post** (~1000 sequential writes at 80 accounts) — now one batched upsert per account;
- it scraped the whole roster in one pass with no budget, so a slow Apify run lost everything.

> `verifyCronSecret` **fails closed**: if `CRON_SECRET` is unset in Vercel, every cron request gets a 401 and nothing is scraped, silently.

---

## Tracking links (the OF side of conversions)
Each IG account carries one OnlyFans tracking link in its bio. Infloww counts the clicks and subs that link produced, so a link bound to Infloww reports real numbers instead of needing them typed in.

**Adding an account asks for its link.** `components/admin/AddAccountFlow.tsx` (used on **Social Accounts → + Add account**) is two steps: the handle, then *"Which OnlyFans tracking link is behind @handle?"*, offering the creator's real Infloww links. **"No link yet"** is always available — a handle can be added before its link exists, and the Overview reports it until one is connected.

**Existing accounts** connect on the creator's **Links** page: *Connect to Infloww* lists the creator's Infloww links with the account each looks like it belongs to, one click each. *Sync stats now* pulls counters on demand.

**Matching** (`matchScore` in `lib/infloww.ts`) reads the team's hand-written link names — `IG sophiaawesst 11.10`, `FB jennasmomdiary 14.10` — stripping the platform word and the date. Scores: **100** exact spelling, **90** equal once dots/underscores are dropped, **75** a near-miss of nearly the same length, **0** otherwise; `suggestAccountForLink` ignores anything under 75. The 100/90 gap matters because Sophia runs both `@sophiaawesst` and `@sophiaa.wesst` — different Instagram accounts that collapse to the same string without punctuation. A suggestion is only ever pre-selected, never applied silently, and generic names (`Sophia Tiktok`) deliberately match nothing. Covered by `tests/lib/infloww-match.test.ts`.

**Stats are cumulative, so days are deltas.** `/v1/links` reports totals since a link was made, and caps its window at **31 days** while filtering on *creation* time — `listTrackingLinks` therefore walks backwards a month at a time (a year by default) and dedupes by id. `lib/infloww-sync.ts` snapshots today's counters into `infloww_link_snapshots`, then writes `today − yesterday` into `link_daily.infloww_*`. **A day is only written when yesterday's snapshot exists**, so a gap stays blank rather than booking weeks as one day; a counter that moves backwards clamps to 0. The first sync on a link only lays the baseline.

The `infloww_*` columns sit **beside** the hand-entered ones and never overwrite them — the upsert names only those columns, so `views` / `profile_views` / `link_clicks` survive a sync untouched.

Runs nightly via `/api/cron/infloww-links` (`30 4 * * *`, after Infloww's ~2h link lag settles), or on demand via `POST /api/admin/infloww/sync-links` (`{creator_id?}`; omitting it is super-admin only).

The Overview flags **live accounts with no Infloww-bound link** — their clicks and subs cannot be attributed. Accounts Instagram has already removed are excluded: they need replacing, not a link. Social Accounts has a matching **OF Link** column and Linked / No link filters.

---

## Account health
Every scrape attempt records what Instagram served, on `social_accounts.status`:

| status | meaning | shown as |
|---|---|---|
| `ok` | profile came back in full | Live |
| `restricted` | exists and public, but Instagram hides it from logged-out visitors | Restricted |
| `private` | exists, flagged private | Private |
| `removed` | Instagram no longer serves the handle — removed, banned or misspelt | Gone |
| `never_seen` | added but not yet scraped | Not checked |

`consecutive_failures` counts how many attempts in a row came back unusable, which separates a blip from an account that is genuinely dark.

**Telling restricted from removed.** Apify returns an item for both, with no `followersCount` either way — so the two are indistinguishable from the counts alone. The avatar is the discriminator: a restricted account still hands back its identity and `profilePicUrl`, a removed one comes back as a bare shell with neither. Verified against a known-restricted and a known-removed handle, matching Instagram's own "Restricted profile" vs "Profile isn't available" pages. Because the avatar survives, **restricted accounts still get a cached profile picture**.

An Apify HTTP failure is classified `transient` and deliberately leaves the stored status untouched — it says nothing about the account.

Surfaced on **Social Accounts** (Health column + filters) and on the **Overview** attention panel, where `removed` is red and `restricted`/`private` amber. Restricted matters beyond tracking: a logged-out visitor sees the same wall the scraper does, so the account is dark to its audience too.

---

## Creator avatars (automatic)
Creators have no avatar of their own — it comes from their Instagram accounts and refreshes itself.

On every scrape `lib/scraper.ts` reads `profilePicUrlHD || profilePicUrl`, and `cacheProfilePic()` copies the **bytes** into the public `creators` storage bucket at `avatars/<social_account_id>.<ext>` (upsert, so no file pile-up). Instagram's own CDN links are signed and expire within about a day, so storing them directly would leave most avatars broken — the cached copy gives a permanent URL, with a `?v=<ts>` suffix to bust caches when the picture changes. `refreshCreatorAvatar()` then points `creators.avatar_url` at the most recently refreshed account.

Render avatars through `avatarSrc()` (`lib/avatar.ts`), which proxies `*.cdninstagram.com` / `*.fbcdn.net` through the image proxy and passes stored URLs straight through. Every avatar `<img>` in the admin uses it.

> A creator only gets an avatar once one of its accounts has been scraped.

---

## Image proxy (SSRF-guarded)
`/api/admin/proxy-image?url=` — admin-only; only fetches `*.cdninstagram.com` / `*.fbcdn.net` over https, blocks private/loopback/link-local/metadata IPs, no redirects, image content-type + size capped. Used by `SocialClient` / `SocialTab`. `lib/ssrf.ts` holds the guard.

---

## File structure (relevant)
```
app/admin/                layout.tsx (sidebar shell + .admin-shell glow), page.tsx (dashboard),
  conversions/ revenue/ social-accounts/ access/ creators/[id]/{analysis,links,settings}
app/api/admin/...         all guarded per lib/auth (see Auth)
app/api/cron/...          CRON_SECRET-gated (fail closed)
components/admin/         Sidebar, ThemeProvider, DashboardClient, ConversionsClient, RevenueClient,
                          SocialClient (Social Media page), TrackingLinksClient, SocialAccountsClient,
                          SettingsClient, DateRangePicker, ui.tsx
lib/                       auth.ts, supabase.ts, rate-limit.ts, ssrf.ts, revenue-cache.ts, scraper.ts,
                           conversion-dataset.ts (management MCP), dashboard-data.ts
supabase/                  schema + migrations (creator_link_layers_2026-10-26.sql is the current model)
```

---

## Build notes
- `next.config.js` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` (true). A few **pre-existing** type errors remain (RevenueClient casts, `CreatorPage` `lock_*` fields not on the `Creator` type) — they don't block the SWC build. `tsconfig.json` now sets `target: es2017`.
- Tests: `npm test` (vitest) — auth/login/creators/redirect/track/rate-limit covered.
