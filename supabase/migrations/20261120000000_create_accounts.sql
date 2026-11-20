-- Create the accounts table before loading supabase/seed.sql.
begin;

create table public.accounts (
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

commit;
