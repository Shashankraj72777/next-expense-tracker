-- Run once in the Supabase SQL Editor for this project.
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 180),
  amount numeric(12,2) not null check (amount > 0),
  category text not null default 'Other',
  date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists expenses_user_date_idx on public.expenses (user_id, date desc);
create index if not exists expenses_user_category_idx on public.expenses (user_id, category);
alter table public.expenses enable row level security;
grant select, insert, update, delete on public.expenses to authenticated;
drop policy if exists "Users can read their own expenses" on public.expenses;
create policy "Users can read their own expenses" on public.expenses for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own expenses" on public.expenses;
create policy "Users can create their own expenses" on public.expenses for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own expenses" on public.expenses;
create policy "Users can update their own expenses" on public.expenses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own expenses" on public.expenses;
create policy "Users can delete their own expenses" on public.expenses for delete to authenticated using ((select auth.uid()) = user_id);
