-- Conversion import reconciliation
-- Generated 2026-06-10 from Google Sheet "Conversion Tracking" (fileId 1pgxqIE3RzSVSPuWihungmkHFq5bm5Fhdl2T3lf9dEvw)
-- vs Supabase project sogytagzrkfuvwrqzqgk, table public.conversion_daily.
-- Contains ONLY rows MISSING from the DB (new (conversion_account_id, date) keys).
-- Idempotent: ON CONFLICT (conversion_account_id, date) DO NOTHING. Safe to re-run.
-- Total NEW rows: 1254
-- Future rows (>2026-06-10) excluded during reconciliation: 148

-- alicebaker (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-16',0,0,0,80, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-17',0,0,0,48, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-18',0,0,0,46, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-19',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-20',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-21',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-22',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-23',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-24',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-25',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-26',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-27',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-28',0,0,0,117, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-29',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-04-30',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-01',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-02',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-03',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-04',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-05',0,0,0,35, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-06',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-07',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-08',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-09',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-10',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-11',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-12',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-13',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-14',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-15',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-16',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-17',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-18',0,0,0,31, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-19',0,0,0,25, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-20',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-21',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-22',0,0,0,33, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-23',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-24',0,0,0,8, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-25',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-26',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-27',0,0,0,25, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-28',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-29',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-30',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-05-31',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-01',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-02',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-03',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-04',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-05',0,0,0,24, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-06',0,0,0,25, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-07',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-08',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-09',0,0,0,21, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('f03134f3-162c-42e0-9304-ed76393f6764','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- aliceebaker (16 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e604f541-618e-4e00-8ffd-b8d5a017342f','aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- ambermoore (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-16',0,0,0,100, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-17',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-18',0,0,0,120, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-19',0,0,0,119, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-20',0,0,0,117, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-21',0,0,0,183, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-22',0,0,0,140, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-23',0,0,0,191, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-24',0,0,0,143, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-25',0,0,0,136, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-26',0,0,0,123, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-27',0,0,0,173, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-28',0,0,0,149, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-29',0,0,0,200, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-04-30',0,0,0,179, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-01',0,0,0,150, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-02',0,0,0,123, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-03',0,0,0,115, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-04',0,0,0,131, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-05',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-06',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-07',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-08',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-09',0,0,0,92, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-10',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-11',0,0,0,96, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-12',0,0,0,95, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-13',0,0,0,93, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-14',0,0,0,134, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-15',0,0,0,89, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-16',0,0,0,117, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-17',0,0,0,101, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-18',0,0,0,96, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-19',0,0,0,117, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-20',0,0,0,130, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-21',0,0,0,121, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-22',0,0,0,107, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-23',0,0,0,104, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-24',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-25',0,0,0,146, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-26',0,0,0,168, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-27',0,0,0,111, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-28',0,0,0,116, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-29',0,0,0,164, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-30',0,0,0,115, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-05-31',0,0,0,97, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-01',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-02',0,0,0,114, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-03',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-04',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-05',0,0,0,89, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-06',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-07',0,0,0,111, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-08',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b0dfc304-09de-4f24-981a-5332ffc10bdb','26750d15-73d0-4336-b56f-7f7b01f77bb5','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- ambermooree (16 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('7b0595f5-e3d8-4bd3-bd6a-198214c4838e','26750d15-73d0-4336-b56f-7f7b01f77bb5','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- anasawyer (17 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a452c0e3-7298-4813-b707-4865fe35698d','40427179-aaa3-4f6d-8c94-aab1042f0e5b','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- annabaileys (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-16',0,0,0,324, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-17',0,0,0,254, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-18',0,0,0,173, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-19',0,0,0,149, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-20',0,0,0,170, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-21',0,0,0,89, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-22',0,0,0,79, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-23',0,0,0,85, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-24',0,0,0,120, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-25',0,0,0,127, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-26',0,0,0,147, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-27',0,0,0,87, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-28',0,0,0,104, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-29',0,0,0,131, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-04-30',0,0,0,108, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-01',0,0,0,93, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-02',0,0,0,87, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-03',0,0,0,126, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-04',0,0,0,116, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-05',0,0,0,114, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-06',0,0,0,111, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-07',0,0,0,105, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-08',0,0,0,96, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-09',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-10',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-11',0,0,0,96, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-12',0,0,0,74, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-13',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-14',0,0,0,115, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-15',0,0,0,126, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-16',0,0,0,132, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-17',0,0,0,124, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-18',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-19',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-20',0,0,0,62, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-21',0,0,0,67, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-22',0,0,0,87, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-23',0,0,0,80, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-24',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-25',0,0,0,78, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-26',0,0,0,111, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-27',0,0,0,105, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-28',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-29',0,0,0,74, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-30',0,0,0,93, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-05-31',0,0,0,61, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-01',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-02',0,0,0,85, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-03',0,0,0,97, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-04',0,0,0,89, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-05',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-06',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-07',0,0,0,47, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-08',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-09',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('3d53baac-3e32-4b9d-9b7e-d6eb5754b882','fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- celinewest (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-16',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-17',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-18',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-19',0,0,0,85, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-20',0,0,0,101, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-21',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-22',0,0,0,89, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-23',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-24',0,0,0,94, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-25',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-26',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-27',0,0,0,73, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-28',0,0,0,97, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-29',0,0,0,72, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-04-30',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-01',0,0,0,89, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-02',0,0,0,69, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-03',0,0,0,72, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-04',0,0,0,66, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-05',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-06',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-07',0,0,0,66, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-08',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-09',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-10',0,0,0,79, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-11',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-12',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-13',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-14',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-15',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-16',0,0,0,69, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-17',0,0,0,63, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-18',0,0,0,63, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-19',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-20',0,0,0,72, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-21',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-22',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-23',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-24',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-25',0,0,0,78, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-26',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-27',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-28',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-29',0,0,0,56, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-30',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-05-31',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-01',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-02',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-03',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-04',0,0,0,62, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-05',0,0,0,76, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-06',0,0,0,76, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-07',0,0,0,121, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-08',0,0,0,74, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-09',0,0,0,79, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ede5aada-52c8-47e8-aac3-4401324883e5','067d31ec-e949-452f-bda7-ea6c09abb61f','2026-06-10',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;

-- chloemiller (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-16',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-17',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-18',0,0,0,25, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-19',0,0,0,100, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-20',0,0,0,94, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-21',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-22',0,0,0,85, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-23',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-24',0,0,0,61, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-25',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-26',0,0,0,79, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-27',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-28',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-29',0,0,0,56, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-04-30',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-01',0,0,0,62, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-02',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-03',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-04',0,0,0,46, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-05',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-06',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-07',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-08',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-09',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-10',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-11',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-12',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-13',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-14',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-15',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-16',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-17',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-18',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-19',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-20',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-21',0,0,0,56, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-22',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-23',0,0,0,62, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-24',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-25',0,0,0,79, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-26',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-27',0,0,0,221, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-28',0,0,0,206, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-29',0,0,0,239, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-30',0,0,0,200, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-05-31',0,0,0,168, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-01',0,0,0,103, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-02',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-03',0,0,0,124, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-04',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-05',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-06',0,0,0,72, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-07',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-08',0,0,0,121, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-09',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('a5eae60c-8415-42f1-950f-4361f3721dd0','82f93dd7-ae62-472a-8408-cf97baa769ae','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- daisycarter (54 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-23',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-25',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-26',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-27',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-28',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-29',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-30',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-10-31',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-01',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-05',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-23',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-25',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-26',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-27',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-28',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-29',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-11-30',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-12-01',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2025-12-02',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-02-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-03-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-03-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-04-05',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-04-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2c509903-5445-485c-bf67-3370beb381fe','8fb12287-491c-40b7-a131-9a62e6634185','2026-04-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- daisywilson (70 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-23',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-25',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-26',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-27',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-28',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2025-10-29',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-16',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-17',0,0,0,94, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-18',0,0,0,157, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-19',0,0,0,146, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-20',0,0,0,167, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-21',0,0,0,161, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-22',0,0,0,148, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-23',0,0,0,151, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-24',0,0,0,150, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-25',0,0,0,104, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-26',0,0,0,104, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-27',0,0,0,104, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-28',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-29',0,0,0,122, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-04-30',0,0,0,103, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-01',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-02',0,0,0,73, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-03',0,0,0,87, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-04',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-05',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-06',0,0,0,114, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-07',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-08',0,0,0,69, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-09',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-10',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-11',0,0,0,101, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-12',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-13',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-14',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-15',0,0,0,87, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-16',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-17',0,0,0,81, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-18',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-19',0,0,0,79, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-20',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-21',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-22',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-23',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-24',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-25',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-26',0,0,0,61, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-27',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-28',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-29',0,0,0,80, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-30',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-05-31',0,0,0,90, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-01',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-02',0,0,0,92, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-03',0,0,0,92, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-04',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-05',0,0,0,90, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-06',0,0,0,80, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-07',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-08',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-09',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('79ae61ac-b9db-402e-8964-493bd0909e5b','e18c08da-8925-42db-834e-1fd8d0ee0467','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- delinarose (4 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92bb4069-5387-440f-b0e0-d21b1145b9e3','60237683-18b9-4ffe-9ecf-b8977c230b4b','2026-01-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92bb4069-5387-440f-b0e0-d21b1145b9e3','60237683-18b9-4ffe-9ecf-b8977c230b4b','2026-01-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92bb4069-5387-440f-b0e0-d21b1145b9e3','60237683-18b9-4ffe-9ecf-b8977c230b4b','2026-01-23',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92bb4069-5387-440f-b0e0-d21b1145b9e3','60237683-18b9-4ffe-9ecf-b8977c230b4b','2026-01-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- elenaraine (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-16',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-17',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-18',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-19',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-20',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-21',0,0,0,28, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-22',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-23',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-24',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-25',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-26',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-27',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-28',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-29',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-04-30',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-01',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-02',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-03',0,0,0,21, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-04',0,0,0,24, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-05',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-06',0,0,0,21, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-07',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-08',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-09',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-10',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-11',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-12',0,0,0,12, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-13',0,0,0,12, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-14',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-15',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-16',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-17',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-18',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-19',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-20',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-21',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-22',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-23',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-24',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-25',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-26',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-27',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-28',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-29',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-30',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-05-31',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-01',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-02',0,0,0,21, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-03',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-04',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-05',0,0,0,13, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-06',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-07',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-08',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-09',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('90280257-e28d-476d-841d-aa406837a942','366ec862-3cdd-4a8a-bcd6-5f5327d8ee79','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- emmabaker (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-16',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-17',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-18',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-19',0,0,0,48, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-20',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-21',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-22',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-23',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-24',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-25',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-26',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-27',0,0,0,63, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-28',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-29',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-04-30',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-01',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-02',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-03',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-04',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-05',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-06',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-07',0,0,0,5, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-08',0,0,0,12, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-09',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-10',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-11',0,0,0,13, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-12',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-13',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-14',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-15',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-16',0,0,0,9, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-17',0,0,0,9, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-18',0,0,0,8, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-19',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-20',0,0,0,12, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-21',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-22',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-23',0,0,0,13, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-24',0,0,0,21, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-25',0,0,0,24, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-26',0,0,0,10, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-27',0,0,0,8, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-28',0,0,0,12, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-29',0,0,0,6, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-30',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-05-31',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-01',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-02',0,0,0,9, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-03',0,0,0,7, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-04',0,0,0,9, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-05',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-06',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-07',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-08',0,0,0,13, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-09',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('2da28256-6170-4c48-9b23-0e27ad95b0bb','e3afdb3a-8547-4c54-a83c-8f18386a015d','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- haileybroown (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-16',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-17',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-18',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-19',0,0,0,33, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-20',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-21',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-22',0,0,0,63, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-23',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-24',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-25',0,0,0,151, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-26',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-27',0,0,0,12, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-28',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-29',0,0,0,4, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-30',0,0,0,5, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-01',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-02',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-03',0,0,0,4, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-04',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-05',0,0,0,7, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-06',0,0,0,3, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-07',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-10',0,0,0,3, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-14',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-15',0,0,0,3, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-17',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-19',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-20',0,0,0,5, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-21',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-22',0,0,0,3, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-23',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-24',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-25',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-26',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-27',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-28',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-29',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-30',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-31',0,0,0,4, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-01',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-02',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-03',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-04',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-05',0,0,0,6, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-06',0,0,0,4, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-07',0,0,0,1, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-08',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-09',0,0,0,2, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97be3d24-57eb-45c8-9548-cdd87e7f1775','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- haileybrown (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-16',0,0,0,260, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-17',0,0,0,448, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-18',0,0,0,594, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-19',0,0,0,520, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-20',0,0,0,618, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-21',0,0,0,507, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-22',0,0,0,549, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-23',0,0,0,588, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-24',0,0,0,516, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-25',0,0,0,279, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-26',0,0,0,162, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-27',0,0,0,164, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-28',0,0,0,183, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-29',0,0,0,189, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-04-30',0,0,0,212, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-01',0,0,0,180, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-02',0,0,0,184, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-03',0,0,0,198, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-04',0,0,0,159, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-05',0,0,0,165, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-06',0,0,0,170, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-07',0,0,0,158, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-08',0,0,0,198, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-09',0,0,0,173, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-10',0,0,0,181, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-11',0,0,0,157, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-12',0,0,0,173, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-13',0,0,0,158, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-14',0,0,0,158, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-15',0,0,0,151, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-16',0,0,0,147, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-17',0,0,0,150, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-18',0,0,0,188, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-19',0,0,0,175, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-20',0,0,0,166, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-21',0,0,0,189, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-22',0,0,0,151, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-23',0,0,0,171, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-24',0,0,0,124, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-25',0,0,0,113, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-26',0,0,0,169, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-27',0,0,0,148, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-28',0,0,0,174, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-29',0,0,0,169, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-30',0,0,0,221, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-05-31',0,0,0,193, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-01',0,0,0,230, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-02',0,0,0,201, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-03',0,0,0,194, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-04',0,0,0,291, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-05',0,0,0,304, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-06',0,0,0,277, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-07',0,0,0,266, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-08',0,0,0,231, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-09',0,0,0,296, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b631b036-c9cf-41f9-9cfd-b8c7b19859f2','ceef18c2-97b9-4d9b-b311-9957d699f90c','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- itsalinaa (48 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-01-01',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-01-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-01-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-01-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-01-25',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-01-29',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-01',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-04',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-05',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-23',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-26',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-27',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-02-28',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-02',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-03',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-04',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-05',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-25',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-26',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-27',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-28',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-29',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-30',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-03-31',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-04-01',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-04-02',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-04-05',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-04-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('1fdb3b13-4505-486c-bb2c-09b24fef465a','dc4abdd1-a616-495c-af59-0de5fc84de24','2026-04-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- jadeadams (55 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-16',0,0,0,87, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-17',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-18',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-19',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-20',0,0,0,76, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-21',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-22',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-23',0,0,0,78, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-24',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-25',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-26',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-27',0,0,0,74, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-28',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-29',0,0,0,66, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-04-30',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-01',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-02',0,0,0,72, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-03',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-04',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-05',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-06',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-07',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-08',0,0,0,66, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-09',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-10',0,0,0,83, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-11',0,0,0,73, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-12',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-13',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-14',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-15',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-16',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-17',0,0,0,74, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-18',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-19',0,0,0,73, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-20',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-21',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-22',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-23',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-24',0,0,0,83, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-25',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-26',0,0,0,79, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-27',0,0,0,93, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-28',0,0,0,90, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-29',0,0,0,66, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-30',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-05-31',0,0,0,83, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-01',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-02',0,0,0,69, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-03',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-04',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-05',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-06',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-07',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-08',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('c59b1092-96e5-4aa2-91f6-d06f3b9998f5','19ce540d-bd59-4294-abc9-41362d12152c','2026-06-09',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;

-- jessysanders (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-16',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-17',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-18',0,0,0,78, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-19',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-20',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-21',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-22',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-23',0,0,0,33, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-24',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-25',0,0,0,85, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-26',0,0,0,69, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-27',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-28',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-29',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-04-30',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-01',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-02',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-03',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-04',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-05',0,0,0,28, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-06',0,0,0,13, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-07',0,0,0,7, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-08',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-09',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-10',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-11',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-12',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-13',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-14',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-15',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-16',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-17',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-18',0,0,0,6, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-19',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-20',0,0,0,18, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-21',0,0,0,13, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-22',0,0,0,15, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-23',0,0,0,13, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-24',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-25',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-26',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-27',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-28',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-29',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-30',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-05-31',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-01',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-02',0,0,0,19, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-03',0,0,0,9, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-04',0,0,0,7, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-05',0,0,0,14, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-06',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-07',0,0,0,8, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-08',0,0,0,12, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-09',0,0,0,8, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('92adb394-4644-45d6-8fe8-32da3bc2aa2d','137283ec-fb49-445f-80f5-79a3129e62f8','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- josiediaz (16 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('de5a1459-e988-4abe-ab66-7d906449a73f','b9a1709d-6b24-446c-bf36-37b6af3833f5','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- katiefisher (22 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-10-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-10-24',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-10-27',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-10-30',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-01',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('68b627c7-a1ed-4db4-8fa9-1d1c335fe75e','a6145d09-3d41-42ff-9476-dcb62476f84b','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- liilybrown (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-16',0,0,0,114, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-17',0,0,0,139, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-18',0,0,0,194, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-19',0,0,0,196, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-20',0,0,0,113, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-21',0,0,0,126, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-22',0,0,0,231, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-23',0,0,0,230, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-24',0,0,0,191, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-25',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-26',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-27',0,0,0,100, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-28',0,0,0,78, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-29',0,0,0,120, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-04-30',0,0,0,99, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-01',0,0,0,96, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-02',0,0,0,114, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-03',0,0,0,120, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-04',0,0,0,115, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-05',0,0,0,125, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-06',0,0,0,106, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-07',0,0,0,115, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-08',0,0,0,125, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-09',0,0,0,118, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-10',0,0,0,131, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-11',0,0,0,95, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-12',0,0,0,116, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-13',0,0,0,112, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-14',0,0,0,110, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-15',0,0,0,94, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-16',0,0,0,103, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-17',0,0,0,109, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-18',0,0,0,111, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-19',0,0,0,97, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-20',0,0,0,90, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-21',0,0,0,133, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-22',0,0,0,105, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-23',0,0,0,114, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-24',0,0,0,94, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-25',0,0,0,110, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-26',0,0,0,93, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-27',0,0,0,102, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-28',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-29',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-30',0,0,0,109, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-05-31',0,0,0,102, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-01',0,0,0,174, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-02',0,0,0,94, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-03',0,0,0,180, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-04',0,0,0,92, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-05',0,0,0,104, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-06',0,0,0,81, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-07',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-08',0,0,0,100, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-09',0,0,0,76, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e699dcc9-b44f-4e3d-8695-4c3aae7762c6','845047d1-7708-4a23-b47e-142219502964','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- lilybroown (17 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('bdf27f89-e1bb-4847-8ae7-eff46702c504','845047d1-7708-4a23-b47e-142219502964','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- mia (3 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b5079f33-23a9-4f8b-9841-5e118cf06fdc','878c7db7-feed-4246-a072-7e057e4d4a91','2026-04-05',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b5079f33-23a9-4f8b-9841-5e118cf06fdc','878c7db7-feed-4246-a072-7e057e4d4a91','2026-04-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('b5079f33-23a9-4f8b-9841-5e118cf06fdc','878c7db7-feed-4246-a072-7e057e4d4a91','2026-04-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- milaahill (3 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('17a54a97-0748-42a3-adb0-e0b2593dc70b','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-05',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('17a54a97-0748-42a3-adb0-e0b2593dc70b','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('17a54a97-0748-42a3-adb0-e0b2593dc70b','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- milahill (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-16',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-17',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-18',0,0,0,66, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-19',0,0,0,143, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-20',0,0,0,220, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-21',0,0,0,186, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-22',0,0,0,83, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-23',0,0,0,62, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-24',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-25',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-26',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-27',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-28',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-29',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-04-30',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-01',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-02',0,0,0,73, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-03',0,0,0,75, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-04',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-05',0,0,0,80, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-06',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-07',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-08',0,0,0,47, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-09',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-10',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-11',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-12',0,0,0,108, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-13',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-14',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-15',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-16',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-17',0,0,0,81, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-18',0,0,0,66, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-19',0,0,0,56, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-20',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-21',0,0,0,81, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-22',0,0,0,93, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-23',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-24',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-25',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-26',0,0,0,90, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-27',0,0,0,103, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-28',0,0,0,80, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-29',0,0,0,92, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-30',0,0,0,88, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-05-31',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-01',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-02',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-03',0,0,0,101, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-04',0,0,0,97, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-05',0,0,0,48, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-06',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-07',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-08',0,0,0,46, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-09',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('ada04a08-5f8c-4e14-999a-c9595c0530a9','002c91dc-db52-4b68-9940-1f8f1b9c1f60','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- ruubichan (17 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-06',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-07',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-08',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-09',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-11',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-12',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-13',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-14',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-15',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-16',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-17',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-18',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-19',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-20',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-21',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('71e33b69-3076-4b8b-9caf-2968b57e28c1','64dbc0f6-0d00-457d-80d7-33d4ce4e971f','2025-11-22',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- skyecarter (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-16',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-17',0,0,0,28, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-18',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-19',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-20',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-21',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-22',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-23',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-24',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-25',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-26',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-27',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-28',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-29',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-04-30',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-01',0,0,0,47, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-02',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-03',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-04',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-05',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-06',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-07',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-08',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-09',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-10',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-11',0,0,0,35, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-12',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-13',0,0,0,42, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-14',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-15',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-16',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-17',0,0,0,35, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-18',0,0,0,31, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-19',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-20',0,0,0,35, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-21',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-22',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-23',0,0,0,31, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-24',0,0,0,56, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-25',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-26',0,0,0,42, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-27',0,0,0,35, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-28',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-29',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-30',0,0,0,42, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-05-31',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-01',0,0,0,42, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-02',0,0,0,35, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-03',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-04',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-05',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-06',0,0,0,32, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-07',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-08',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-09',0,0,0,33, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('fd736644-fe0e-422d-a5b8-41274a4d27c1','e906b36e-7b81-4813-9459-558c8845ad97','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- sophiawest (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-16',0,0,0,91, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-17',0,0,0,63, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-18',0,0,0,61, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-19',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-20',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-21',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-22',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-23',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-24',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-25',0,0,0,53, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-26',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-27',0,0,0,28, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-28',0,0,0,21, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-29',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-04-30',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-01',0,0,0,24, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-02',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-03',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-04',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-05',0,0,0,25, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-06',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-07',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-08',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-09',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-10',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-11',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-12',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-13',0,0,0,10, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-14',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-15',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-16',0,0,0,22, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-17',0,0,0,10, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-18',0,0,0,10, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-19',0,0,0,17, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-20',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-21',0,0,0,11, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-22',0,0,0,47, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-23',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-24',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-25',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-26',0,0,0,23, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-27',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-28',0,0,0,33, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-29',0,0,0,33, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-30',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-05-31',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-01',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-02',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-03',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-04',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-05',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-06',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-07',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-08',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-09',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('97c32435-42c4-4173-8dbb-561bc178f932','62c31190-a8d5-4daf-8464-4cc08a9acb19','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- sophieparker (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-16',0,0,0,62, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-17',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-18',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-19',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-20',0,0,0,76, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-21',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-22',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-23',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-24',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-25',0,0,0,90, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-26',0,0,0,97, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-27',0,0,0,82, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-28',0,0,0,63, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-29',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-04-30',0,0,0,64, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-01',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-02',0,0,0,142, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-03',0,0,0,106, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-04',0,0,0,78, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-05',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-06',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-07',0,0,0,46, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-08',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-09',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-10',0,0,0,54, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-11',0,0,0,47, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-12',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-13',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-14',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-15',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-16',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-17',0,0,0,44, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-18',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-19',0,0,0,38, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-20',0,0,0,42, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-21',0,0,0,62, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-22',0,0,0,58, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-23',0,0,0,61, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-24',0,0,0,48, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-25',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-26',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-27',0,0,0,100, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-28',0,0,0,105, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-29',0,0,0,128, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-30',0,0,0,77, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-05-31',0,0,0,70, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-01',0,0,0,98, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-02',0,0,0,65, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-03',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-04',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-05',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-06',0,0,0,49, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-07',0,0,0,51, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-08',0,0,0,60, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-09',0,0,0,69, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('05457caa-deae-4b49-bea7-3ca818904d0b','def5718c-1859-4f53-9c3d-b0e2661e9542','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

-- zoecarter (56 new)
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-16',0,0,0,57, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-17',0,0,0,34, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-18',0,0,0,46, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-19',0,0,0,50, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-20',0,0,0,59, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-21',0,0,0,191, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-22',0,0,0,235, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-23',0,0,0,154, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-24',0,0,0,93, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-25',0,0,0,103, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-26',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-27',0,0,0,76, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-28',0,0,0,110, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-29',0,0,0,113, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-04-30',0,0,0,73, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-01',0,0,0,84, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-02',0,0,0,67, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-03',0,0,0,89, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-04',0,0,0,86, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-05',0,0,0,100, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-06',0,0,0,71, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-07',0,0,0,61, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-08',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-09',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-10',0,0,0,68, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-11',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-12',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-13',0,0,0,72, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-14',0,0,0,47, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-15',0,0,0,40, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-16',0,0,0,55, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-17',0,0,0,35, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-18',0,0,0,52, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-19',0,0,0,45, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-20',0,0,0,16, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-21',0,0,0,24, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-22',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-23',0,0,0,29, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-24',0,0,0,25, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-25',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-26',0,0,0,37, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-27',0,0,0,26, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-28',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-29',0,0,0,27, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-30',0,0,0,43, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-05-31',0,0,0,31, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-01',0,0,0,25, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-02',0,0,0,20, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-03',0,0,0,30, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-04',0,0,0,28, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-05',0,0,0,31, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-06',0,0,0,46, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-07',0,0,0,39, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-08',0,0,0,36, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-09',0,0,0,41, now())
on conflict (conversion_account_id, date) do nothing;
insert into public.conversion_daily (conversion_account_id, creator_id, date, views, profile_views, link_clicks, new_subs, updated_at)
values ('e268f556-2d2a-4270-a79c-71f845472d7c','f78ebe73-74b7-47fa-80b2-f9d20bccb3d6','2026-06-10',0,0,0,0, now())
on conflict (conversion_account_id, date) do nothing;

