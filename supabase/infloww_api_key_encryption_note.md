# Infloww API key — encryption at rest (migration note)

## What changed
The Infloww API key in `infloww_config.api_key` is now **encrypted at rest** with
AES-GCM (`lib/infloww-crypto.ts`). It is:

- **Encrypted** on write in `app/api/admin/revenue/config/route.ts` (PUT).
- **Decrypted** server-side only when an Infloww API call needs it
  (`lib/revenue-cache.ts`, `app/api/admin/revenue/infloww-creators/route.ts`,
  `app/api/admin/revenue/data/route.ts`).
- **Never returned to the client** — the config GET/PUT responses now expose only
  `api_key_masked` (last 8 chars).

Stored format: `enc:v1:<base64url(iv)>.<base64url(ciphertext+tag)>`.

## Env var
Set `INFLOWW_KEY_ENC_SECRET` (a long random string) in every environment.
If unset it falls back to `SUPABASE_SERVICE_ROLE_KEY`, so nothing breaks without
it — but set it explicitly in production. See `.env.example`.

⚠️ Rotating `INFLOWW_KEY_ENC_SECRET` (or the service-role key, if relying on the
fallback) makes the already-stored ciphertext undecryptable. After rotating,
re-save the key (see below).

## Migrating the existing row
**No SQL migration is needed.** Encryption happens in application code, and reads
are backward-compatible: any value **without** the `enc:v1:` prefix is treated as
legacy plaintext and used as-is. So the current plaintext key keeps working until
it is re-saved.

To actually encrypt the stored value, do **one** of:

1. **Re-save in the UI (recommended).** Deploy, then open **Revenue → Settings**,
   paste the API key into the "API key" field, and click Save. The PUT route
   encrypts and overwrites the row. Done.

2. **Re-save via API** (equivalent), as a super-admin with a valid session:
   ```bash
   curl -X PUT https://<host>/api/admin/revenue/config \
     -H 'Content-Type: application/json' \
     --cookie 'admin_session=<your-session-cookie>' \
     -d '{"api_key":"<the-current-plaintext-key>"}'
   ```

After either, confirm `infloww_config.api_key` starts with `enc:v1:`:
```sql
select left(api_key, 7) as prefix, api_key_updated_at from public.infloww_config;
-- expect prefix = 'enc:v1:'
```

`agency_oid`, `refund_threshold_dollars`, and `fetching_enabled` are unchanged and
remain plaintext.
