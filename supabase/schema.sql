-- LTE_TEMP db_connection demo schema. Run before seed.sql in Supabase SQL Editor.
-- This matches the current no-auth demo: anonymous clients can SELECT demo accounts.
-- No anonymous INSERT, UPDATE, or DELETE permissions are granted.
begin;

create table if not exists public.accounts (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  persona text not null,
  name text not null,
  is_active boolean not null default false,
  domains jsonb not null,
  roles jsonb not null,
  learner_profile jsonb not null,
  learner_capabilities jsonb not null,
  skill_gap jsonb not null,
  profile_snapshot jsonb not null,
  learning_path jsonb not null,
  learning_path_courses jsonb not null,
  learning_tracks jsonb not null,
  track_evidence jsonb not null,
  dashboard jsonb not null,
  course_content jsonb not null,
  stage_meta jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  email text null,
  constraint accounts_pkey primary key (id),
  constraint accounts_slug_key unique (slug)
) tablespace pg_default;

create unique index if not exists accounts_one_active
  on public.accounts using btree (is_active) tablespace pg_default
  where is_active;

alter table public.accounts enable row level security;
grant usage on schema public to anon, authenticated;
grant select on public.accounts to anon, authenticated;
drop policy if exists accounts_demo_read on public.accounts;
create policy accounts_demo_read on public.accounts
  for select to anon, authenticated using (true);

commit;
