-- Execute in Supabase SQL Editor. One JSON snapshot per authenticated owner.
create table if not exists public.user_data (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
revoke all on public.user_data from anon;
grant select, insert, update, delete on public.user_data to authenticated;
drop policy if exists "owner_select" on public.user_data;
drop policy if exists "owner_insert" on public.user_data;
drop policy if exists "owner_update" on public.user_data;
drop policy if exists "owner_delete" on public.user_data;
create policy "owner_select" on public.user_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "owner_insert" on public.user_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owner_update" on public.user_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owner_delete" on public.user_data for delete to authenticated using ((select auth.uid()) = user_id);
