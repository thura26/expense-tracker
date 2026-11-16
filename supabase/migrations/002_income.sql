-- =============================================================================
-- MoneyTrack — add income tracking
-- Run this after 001_init.sql if that file was applied before income support.
-- Safe to re-run.
-- =============================================================================

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  source text not null default 'other'
    check (source in (
      'salary', 'freelance', 'business', 'investment', 'gift', 'other'
    )),
  date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists incomes_user_date_idx
  on public.incomes (user_id, date desc, created_at desc);

alter table public.incomes enable row level security;
alter table public.incomes replica identity full;

grant select, insert, update, delete on public.incomes to authenticated;

drop policy if exists "incomes: owner can read" on public.incomes;
create policy "incomes: owner can read"
  on public.incomes for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "incomes: owner can insert" on public.incomes;
create policy "incomes: owner can insert"
  on public.incomes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "incomes: owner can update" on public.incomes;
create policy "incomes: owner can update"
  on public.incomes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "incomes: owner can delete" on public.incomes;
create policy "incomes: owner can delete"
  on public.incomes for delete
  to authenticated
  using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.incomes;
exception when duplicate_object then null;
end $$;
