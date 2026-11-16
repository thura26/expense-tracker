-- =============================================================================
-- MoneyTrack — Supabase schema, security, storage, realtime, and RPC
-- Run this whole file once in Supabase Dashboard → SQL Editor.
-- It is safe to re-run for the most part (policies are dropped/recreated).
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  phone text,
  currency text not null default 'MMK'
    check (currency in (
      'MMK', 'USD', 'EUR', 'THB', 'SGD', 'EGP', 'SAR',
      'GBP', 'JPY', 'MYR', 'CNY', 'INR', 'AUD', 'CAD'
    )),
  monthly_income numeric(14, 2) not null default 0
    check (monthly_income >= 0),
  income_source text,
  budget_total numeric(14, 2) not null default 0
    check (budget_total >= 0),
  budget_allocations jsonb not null default
    '{"food":30,"transport":15,"shopping":20,"bills":25,"other":10}'::jsonb,
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  category text not null default 'other'
    check (category in (
      'food', 'transport', 'shopping', 'health', 'education',
      'entertainment', 'bills', 'gifts', 'other'
    )),
  date date not null default current_date,
  payment_method text not null default 'Cash',
  note text,
  receipt_path text,
  created_at timestamptz not null default now()
);

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

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  amount numeric(14, 2) not null check (amount > 0),
  due_date date not null default current_date,
  frequency text not null default 'monthly'
    check (frequency in ('once', 'monthly', 'weekly')),
  category text not null default 'bills'
    check (category in (
      'food', 'transport', 'shopping', 'health', 'education',
      'entertainment', 'bills', 'gifts', 'other'
    )),
  active boolean not null default true,
  last_paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, date desc, created_at desc);

create index if not exists incomes_user_date_idx
  on public.incomes (user_id, date desc, created_at desc);

create index if not exists bills_user_due_idx
  on public.bills (user_id, due_date asc);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create a profile for every new auth user
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, phone)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', new.phone)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.incomes enable row level security;
alter table public.bills enable row level security;

grant select, insert, update, delete
  on public.profiles, public.expenses, public.incomes, public.bills
  to authenticated;

drop policy if exists "profiles: owner can read" on public.profiles;
create policy "profiles: owner can read"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles: owner can insert" on public.profiles;
create policy "profiles: owner can insert"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles: owner can update" on public.profiles;
create policy "profiles: owner can update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "expenses: owner can read" on public.expenses;
create policy "expenses: owner can read"
  on public.expenses for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "expenses: owner can insert" on public.expenses;
create policy "expenses: owner can insert"
  on public.expenses for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "expenses: owner can update" on public.expenses;
create policy "expenses: owner can update"
  on public.expenses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "expenses: owner can delete" on public.expenses;
create policy "expenses: owner can delete"
  on public.expenses for delete
  to authenticated
  using (auth.uid() = user_id);

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

drop policy if exists "bills: owner can read" on public.bills;
create policy "bills: owner can read"
  on public.bills for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "bills: owner can insert" on public.bills;
create policy "bills: owner can insert"
  on public.bills for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "bills: owner can update" on public.bills;
create policy "bills: owner can update"
  on public.bills for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bills: owner can delete" on public.bills;
create policy "bills: owner can delete"
  on public.bills for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Atomic "mark bill paid" RPC
-- Inserts the expense and advances/archives the bill in one transaction.
-- -----------------------------------------------------------------------------

create or replace function public.mark_bill_paid(p_bill_id uuid)
returns public.bills
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_bill public.bills;
  v_next date;
begin
  select *
    into v_bill
    from public.bills
   where id = p_bill_id
     and user_id = auth.uid()
     for update;

  if not found then
    raise exception 'Bill not found' using errcode = 'P0002';
  end if;

  insert into public.expenses (
    user_id, amount, category, date, payment_method, note
  )
  values (
    auth.uid(),
    v_bill.amount,
    v_bill.category,
    current_date,
    'Bill payment',
    'Bill: ' || v_bill.title
  );

  if v_bill.frequency = 'once' then
    update public.bills
       set active = false,
           last_paid_at = now()
     where id = v_bill.id
     returning * into v_bill;
  else
    v_next := v_bill.due_date;
    loop
      v_next := case
        when v_bill.frequency = 'monthly'
          then (v_next + interval '1 month')::date
        else (v_next + interval '7 days')::date
      end;
      exit when v_next > current_date;
    end loop;

    update public.bills
       set active = true,
           due_date = v_next,
           last_paid_at = now()
     where id = v_bill.id
     returning * into v_bill;
  end if;

  return v_bill;
end;
$$;

grant execute on function public.mark_bill_paid(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Realtime
-- -----------------------------------------------------------------------------

alter table public.expenses replica identity full;
alter table public.incomes replica identity full;
alter table public.bills replica identity full;
alter table public.profiles replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.expenses;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.incomes;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.bills;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- Private receipt storage
-- -----------------------------------------------------------------------------

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'receipts',
  'receipts',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "receipts: owner can upload" on storage.objects;
create policy "receipts: owner can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "receipts: owner can read" on storage.objects;
create policy "receipts: owner can read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "receipts: owner can update" on storage.objects;
create policy "receipts: owner can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "receipts: owner can delete" on storage.objects;
create policy "receipts: owner can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
