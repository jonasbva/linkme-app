# Dashboard API v1

The operational dashboard API lives at `/api/v1` on the same origin as the dashboard. It supports reading and changing creators, social accounts, tracking links, daily subscriber/traffic counts, targets, tags, emergency status, Infloww mappings, scraping and synchronization. Changes go through the dashboard's existing handlers and appear in the dashboard.

Deploy this code and apply `supabase/migrations/20261115130800_dashboard_api_access.sql` before using these endpoints in production. The code does not itself create a key or grant Marlon new permissions.

## Give Marlon access

1. Sign in as a super admin and open **Access → API keys**.
2. Name the key **Marlon** and choose its expiry (1–365 days). For full operational access, select an active super-admin permission owner. For creator-scoped access, select Marlon's account with the relevant assigned permissions.
3. Create the key and copy its one-time value. Give Marlon that key and this document through your chosen secure channel. The dashboard stores a SHA-256 hash, not the complete key.
4. Marlon sends `Authorization: Bearer <API_KEY>` on every request. The key inherits the selected permission owner's rights; creator creation/deletion, account bulk edits, mappings, global revenue reads and uploads require a super-admin permission owner. A separately labeled key gives Marlon those operational actions without sharing an admin login or changing Marlon's own account role. Creating a key does not promote an account.

The key owner's current account activity, super-admin status and creator permissions are checked on requests. Keys can be revoked independently in Access; expiration, revocation or deactivation stops new requests. Revocation does not cancel a write already running.

No database credential or dashboard session cookie is needed. Tokens in URLs, query strings and the existing read-only management MCP token do not grant write access. This is an HTTP JSON API, not an MCP endpoint. Key/access administration, team/roles, passwords, integration credentials, image proxy and legacy conversion accounts are outside its scope.

## First request

Set `DASHBOARD_ORIGIN` to the deployed dashboard origin and `DASHBOARD_API_KEY` in your own environment or secret store. The examples deliberately contain no real credentials.

```bash
curl --fail-with-body "$DASHBOARD_ORIGIN/api/v1" \
  -H "Authorization: Bearer $DASHBOARD_API_KEY"
```

The authenticated discovery response lists every supported path, method, required permission, destructive warning and request examples. Replace example ID placeholders with UUIDs from list/read responses. Successful response shapes match the dashboard handlers: some return arrays directly and others return named objects. There is no universal `data` envelope.

Requests are limited to 120 per key per minute. A rejected key returns 401; insufficient permission returns 403; unknown resources/routes return 404; unsupported methods return 405 with `Allow`; malformed input returns 400; oversized input returns 413; unsupported content type returns 415; rate limiting returns 429; database/auth infrastructure failures return 5xx. Do not automatically retry a mutation after a timeout or 5xx: read the affected record first because it may already have been applied. This API does not provide idempotency keys or multi-request transactions.

Responses are private and uncached. Authenticated requests are audited by key, owner, canonical route, method, status and duration. The audit excludes request bodies, headers, query strings and keys; a temporarily unavailable audit store does not roll back or mask an already-applied operation.

## Creators and social accounts

| Method and path | Payload or query | Permission |
| --- | --- | --- |
| `GET /creators` | `include_archived=1` includes archived creators | Creator visibility |
| `POST /creators` | Required `display_name`; optional `of_handle`, `is_active`; slug is derived automatically | Super admin |
| `GET /creators/:id` | Creator profile | Creator visibility |
| `PATCH /creators/:id` or `PUT` | One or more of `display_name`, `slug`, `username`, `bio`, `avatar_url`, `is_active`; PUT is a partial update too | `edit_settings` |
| `DELETE /creators/:id` | No body; permanently deletes cascading history | Super admin |
| `PATCH /creators/:id/of-handle` | `{ "of_handle": "normalized_handle" }` or `null` to clear | `edit_settings` |
| `GET /social-accounts` | Optional `creator_id` | Creator visibility; `view_social` when creator specified |
| `POST /social-accounts` | `creator_id`, `platform` (`instagram`/`tiktok`), `username`; optional `tracking_link` below | `edit_social` |
| `PATCH /social-accounts` | `{ "updates": [{ "id": "UUID", "username": "handle", "platform": "instagram", "is_active": true }] }` | Super admin |
| `DELETE /social-accounts` | Query `id=UUID`, or JSON `{ "ids": ["UUID"] }`; permanently deletes related history | Super admin |
| `GET /creators/:id/posts` | Optional `social_account_id`, `limit` (1–200, default 50), `offset` (0–100000) | `view_social` |
| `PATCH /creators/:id/posts/:postId` | `{ "is_trial": true }` | `edit_social` |
| `GET /social-snapshots` | Required `creator_id`; optional `start`, `end` (`YYYY-MM-DD`) | `view_social` |

Paths in these tables are relative to `/api/v1`. A permission on a creator also requires visibility of that creator. Super admins retain their dashboard access. The create operation accepts a plain OnlyFans handle, @handle or onlyfans.com profile URL; it derives the slug from that handle, or from the name when the handle is omitted. Set biography/avatar fields with a subsequent PATCH. Manual slug updates use lowercase letters/numbers, underscores and hyphens. Creator create accepts only the documented editable fields; other columns cannot be mass assigned.

Archive a creator with `PATCH { "is_active": false }` when its history should remain available. Delete operations are permanent. Social account bulk updates return `{ "success": number, "errors": number }` and can partially succeed. Adding an account returns `{ "account": ..., "link": ... }`; if account creation succeeds but its optional tracking link fails, the response includes `warning`. Inspect that warning rather than adding the account again.

## Tracking links

| Method and path | Payload or query | Permission |
| --- | --- | --- |
| `GET /creators/:id/tracking-links` | List creator's links | `view_conversions` |
| `POST /creators/:id/tracking-links` | Required `label`; optional `url`, `social_account_id`, `infloww_link_id`, `infloww_link_name`, `infloww_code` | `input_conversions` |
| `PATCH /creators/:id/tracking-links/:linkId` | Any of `label`, `url` (empty to clear), `social_account_id` (null to detach), `is_active`, `sort_order`, `infloww_link_id` (null to disconnect), `infloww_link_name`, `infloww_code` | `input_conversions` |
| `DELETE /creators/:id/tracking-links/:linkId` | Permanently deletes link and daily history | `input_conversions` |
| `GET /creators/:id/infloww-links` | Optional `username` for ranked account-match suggestions | `view_conversions` |

An assigned social account must belong to the named creator, and one Infloww link cannot be assigned twice. To set a link while adding an account, put the same link fields in the optional `tracking_link` object of `POST /social-accounts`. Do not automatically apply a fuzzy suggestion: use the returned IDs and confirm the intended account.

## Subscriber counts, traffic and targets

Read with `GET /conversions`:

| `action` query parameter | Other query parameters |
| --- | --- |
| `expectations` | None |
| `creator_daily` | Optional `creator_id`, `from`, `to` |
| `link_daily` | Optional `creator_id`, `tracking_link_id`, `from`, `to` |

These reads retain creator visibility restrictions. Dates are valid calendar dates in `YYYY-MM-DD` format. A missing row means missing data; a stored zero means someone entered zero.

Write with `POST /conversions`, JSON `action` and the fields below. Each affected creator requires `input_conversions`.

| Action | Fields |
| --- | --- |
| `set_expectation` | `creator_id`, `daily_sub_target` |
| `update_creator_cell` | `creator_id`, `date`, `value` (non-negative integer; `null` deletes that observation) |
| `set_daily_subs` | `date`, `entries: [{ creator_id, new_subs }]` |
| `update_link_cell` | `tracking_link_id`, `date`, `field` (`views`, `profile_views`, `link_clicks`), `value` |
| `set_link_daily` | `date`, `entries: [{ tracking_link_id, views, profile_views, link_clicks }]` |

Counts/targets must be JSON integers from 0 through 2147483647. Strings, fractions, negative values and impossible dates are rejected. Batch writes accept up to 500 distinct IDs; an unknown batch tracking-link ID rejects the request. Subscriber corrections replace the row for the same creator/date. Link batches replace all three manual traffic counts for the same link/date; Infloww's separate counters are not those manual fields.

```bash
curl --fail-with-body "$DASHBOARD_ORIGIN/api/v1/conversions" \
  -X POST -H "Authorization: Bearer $DASHBOARD_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"action":"update_creator_cell","creator_id":"CREATOR_UUID","date":"2026-11-14","value":120}'
```

Replace `CREATOR_UUID` with the actual ID returned by `GET /creators`. To remove that entry, repeat with `"value":null`; to record zero, send `"value":0`.

## Tags and revenue operations

`GET /tags` returns the shared tag catalog. `POST /tags` accepts:

| Action | Fields | Permission |
| --- | --- | --- |
| `create_tag` | `name`, optional `color` (`#RRGGBB`) | Super admin |
| `update_tag` | `tag_id`, optional `name`, `color` | Super admin |
| `delete_tag` | `tag_id`; deletes assignments too | Super admin |
| `assign_tag`, `unassign_tag` | `creator_id`, `tag_id` | `edit_settings` |

| Method and path | Payload or query | Permission |
| --- | --- | --- |
| `GET /revenue/data` | Optional `days` (1–366), `date`; JSON responses only, `stream=true` is rejected | Super admin |
| `GET /revenue/cache` | `from`/`to` as epoch milliseconds or ISO timestamps, or `key=today`/`YYYY-MM-DD`; defaults to today | Super admin |
| `POST /revenue/cache` | Query `from`, `to`; rebuilds and returns cache data | Super admin |
| `GET /revenue/emergency` | All emergency statuses | Super admin |
| `POST /revenue/emergency` | `creator_id`, optional `emergency_since` (`YYYY-MM-DD` or null), `notes` | `edit_settings` |
| `GET /revenue/mapping` | Read Infloww mappings | Super admin |
| `POST /revenue/mapping` | `creator_id`, `infloww_creator_id`, optional `infloww_creator_name` | Super admin |
| `DELETE /revenue/mapping` | Required query `creator_id` | Super admin |
| `GET /revenue/infloww-creators` | Live Infloww creator directory | Super admin |
| `GET /revenue/infloww-creators-cached` | Cached Infloww creator directory | Super admin |

The API applies a super-admin gate to global revenue responses because those existing dashboard handlers return agency-wide data. It does not attempt to truncate aggregate data for a creator-scoped key. Emergency writes additionally require settings access on the specified creator. A mapping POST removes conflicting mappings for either supplied ID before creating its replacement.

## Scraping, sync, uploads and challenge

| Method and path | Payload or query | Permission |
| --- | --- | --- |
| `POST /scrape` | `social_account_id` or `creator_id` | `edit_social` |
| `GET /scrape` | Required `social_account_id`, optional `limit` (1–200) | `view_social` |
| `POST /scrape-all` | `{ "jobId": "CLIENT_GENERATED_UUID" }`; starts a bulk job | Super admin |
| `GET /scrape-all` | Required `jobId` query parameter | Super admin |
| `POST /infloww/sync-links` | Optional `{ "creator_id": "UUID" }`; omitted means all creators | `input_conversions` on creator, or super admin for all |
| `POST /upload` | Multipart `file`; optional `bucket` (`creators`, default, or `images`) | Super admin |
| `GET /challenge` | Optional `asOf=YYYY-MM-DD` within the configured challenge | Active dashboard user; creator details remain scoped |

Scrapes invoke the configured paid service. Sync writes bindings, snapshots and daily Infloww deltas. Cache reads can also trigger a stale-cache refresh. Those operations can take several minutes; use a suitable timeout and inspect the resulting data before retrying. Bulk scrape runs until completion within the server budget; GET reads its progress while POST is running.

Uploads accept PNG, JPEG, WebP and GIF images up to 10 MB, with matching file signatures. HTML, SVG and arbitrary bucket access are rejected. The response is `{ "url": "PUBLIC_STORAGE_URL" }`; uploading alone does not assign the image to a creator. Set the creator's `avatar_url` separately. All JSON request bodies have a 1 MB limit.
