create extension if not exists pgcrypto;

create table if not exists public.submission_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  quiz_answers jsonb not null,
  menu_items jsonb not null,
  recommendation jsonb not null,
  user_agent text
);

alter table public.submission_history enable row level security;

create index if not exists submission_history_created_at_idx
  on public.submission_history (created_at desc);
