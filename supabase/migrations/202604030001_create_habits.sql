create extension if not exists pgcrypto;

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text not null default '🎯',
  completed_dates jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habits_created_at_idx on public.habits (created_at);

alter table public.habits enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'habits'
      and policyname = 'Users can view their own habits'
  ) then
    create policy "Users can view their own habits"
      on public.habits
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'habits'
      and policyname = 'Users can insert their own habits'
  ) then
    create policy "Users can insert their own habits"
      on public.habits
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'habits'
      and policyname = 'Users can update their own habits'
  ) then
    create policy "Users can update their own habits"
      on public.habits
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'habits'
      and policyname = 'Users can delete their own habits'
  ) then
    create policy "Users can delete their own habits"
      on public.habits
      for delete
      using (auth.uid() = user_id);
  end if;
end
$$;
