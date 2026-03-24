# LinkMe Admin Dashboard — Project Context

## Overview
LinkMe is a Next.js 14 (App Router, TypeScript) link-in-bio platform for adult content creators. There is a public-facing creator page and a private admin dashboard. Hosted on Vercel, database on Supabase.

- **Live URL:** https://linkme-app.vercel.app
- **Admin:** https://linkme-app.vercel.app/admin
- **Repo:** https://github.com/jonasbva/linkme-app
- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase, Vercel

---

## File Structure (relevant parts)

```
app/
  admin/
    layout.tsx                        # Admin shell, wraps all admin pages
    page.tsx                          # Dashboard home
    creators/
      page.tsx                        # Creators list (Edit · Analysis · Preview per row)
      [id]/
        page.tsx                      # Redirects → /edit
        edit/page.tsx                 # Edit page: Profile + Links sub-tabs
        analysis/page.tsx             # Analysis page: Social Media + Link Analysis sub-tabs
        links/page.tsx                # Dedicated links management page
    domains/
      page.tsx                        # Shared domains management page
  api/
    admin/
      creators/route.ts               # GET/POST creators
      creators/[id]/route.ts          # GET/PATCH/DELETE creator
      creators/[id]/links/route.ts    # GET/POST links
      creators/[id]/links/[linkId]/route.ts  # PATCH/DELETE individual link
      check-domain/route.ts           # DNS verification via Google DNS-over-HTTPS
      proxy-image/route.ts            # Server-side image proxy (Instagram CORS bypass)
      upload/route.ts                 # Image upload to Supabase storage
      login/route.ts
      logout/route.ts
      scrape/route.ts
      social-accounts/route.ts
    track/route.ts                    # Click/view tracking
    redirect/route.ts
    resolve-domain/route.ts

components/
  admin/
    AdminNav.tsx                      # Nav: Dashboard · Creators · Domains + theme toggle
    ThemeProvider.tsx                 # Light/dark/system theme context
    CreatorEditor.tsx                 # Shared editor component (mode="edit" | "analysis")
    LinksManager.tsx                  # Standalone links management client component
    DomainsManager.tsx                # Domains management client component
    SocialTab.tsx                     # Instagram post/account analytics tab
  CreatorPage.tsx                     # Public-facing creator link page
```

---

## Database Tables (Supabase)

**creators**
- id, display_name, slug, username, bio, avatar_url
- background_color, button_color, text_color, button_style
- link_font_size, link_text_align, link_icon_style (`inline` | `large`)
- background_image_url, avatar_position, hero_height, hero_position, hero_scale
- custom_domain, show_verified, show_footer, is_active

**links**
- id, creator_id, title, url, icon, custom_icon_url
- thumbnail_url, thumbnail_position, thumbnail_height
- sort_order, is_active

---

## Admin Pages

### `/admin/creators`
List of all creators. Each row: avatar, name, slug + **Edit · Analysis · Preview ↗** buttons.

### `/admin/creators/[id]/edit`
Renders `<CreatorEditor mode="edit" />`. Sub-tabs: **Profile** (all creator settings) and **Links** (existing links + add new).

### `/admin/creators/[id]/analysis`
Renders `<CreatorEditor mode="analysis" />`. Sub-tabs: **Social Media** (Instagram posts/stats via `SocialTab`) and **Link Analysis** (click chart, countries, devices).

### `/admin/creators/[id]/links`
Renders `<LinksManager />`. Full-page link management: collapsible link cards, ▲/▼ reorder, toggle active, edit fields, live preview card, add new link. "Save changes" saves all at once.

### `/admin/domains`
Renders `<DomainsManager />`. Shared across all creators. Shows all custom domains with:
- Live DNS status (auto-checked on load via Google DNS API)
- "Check DNS" button, "Setup" expands CNAME instructions
- CNAME target: `cname.vercel-dns.com`
- "Add domain" form: pick creator + enter domain
- "Remove" to clear a domain from a creator

---

## Key Components

### `CreatorEditor.tsx`
- `mode="edit"`: shows Profile + Links sub-tabs
- `mode="analysis"`: shows Social Media + Link Analysis sub-tabs
- Edit mode header has a **Preview ↗** button
- Link preview cards use **creator's profile settings** (button_color, text_color, link_font_size, link_text_align, link_icon_style) — never the admin theme
- Icons: `PLATFORM_ICONS` map + `renderPreviewIcon(link, size)` — checks `custom_icon_url` first, falls back to platform SVG. `link_icon_style === 'large'` shows 36px icon top-left; `inline` shows 20px icon in the gradient overlay

### `SocialTab.tsx`
- Full light/dark mode support via `useTheme` / `isLight`
- Instagram images loaded via `/api/admin/proxy-image?url=` (CORS bypass)
- Post cards: 260×320px
- Caption text always white; stats bar responds to light/dark

### `LinksManager.tsx`
- Standalone client component, uses same API routes as CreatorEditor
- Collapse/expand per link, reorder, add, delete, toggle active
- Live preview using creator profile settings + `renderIcon(link, size)`

### `DomainsManager.tsx`
- On mount, auto-checks DNS for all existing domains
- DNS check hits `/api/admin/check-domain?domain=` which uses Google DNS-over-HTTPS
- Checks for CNAME containing "vercel" or A record matching Vercel IPs (76.76.21.21/22)

---

## Image Proxy
**`/api/admin/proxy-image?url=<encoded_url>`**
Fetches images server-side with browser User-Agent + `Referer: https://www.instagram.com/`. Needed to bypass Instagram CDN hotlink protection. Returns image buffer with `Cache-Control: public, max-age=3600`.

---

## Auth
Cookie-based: `admin_auth=true`. Set by `/api/admin/login`, cleared by `/api/admin/logout`. All admin API routes check `cookies().get('admin_auth')?.value === 'true'`.

---

## Theme
`ThemeProvider` wraps the admin layout. Three modes: `system` / `light` / `dark`. Cycled via the System button in the nav. Components use `const { resolved } = useTheme()` and check `resolved === 'light'`.

---

## Custom Domains Flow
1. Add domain in `/admin/domains` → saves to `creator.custom_domain` in Supabase
2. Add CNAME `@ → cname.vercel-dns.com` at domain registrar
3. Add domain in Vercel project → Settings → Domains
4. Click "Check DNS" to verify — green when both DNS + Vercel are configured

The public creator page at `CreatorPage.tsx` is resolved via `resolve-domain` API route which looks up the creator by custom_domain or slug.
