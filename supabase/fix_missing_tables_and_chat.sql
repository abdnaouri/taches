-- ====================================================================
-- MIGRATION: FIX MISSING TABLES (MESSAGES, REVIEWS, SUBSCRIPTIONS, CAMPAIGNS)
-- Run this script in the Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/vzrmunzfkftydvgmylvu/sql)
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CREATE MESSAGES TABLE IF NOT EXISTS
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  sender_name text not null,
  sender_avatar text,
  receiver_id uuid references public.profiles(id) on delete set null,
  content text not null,
  attachment_url text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for lightning fast chat retrieval
create index if not exists idx_messages_task_id on public.messages(task_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);

-- Enable RLS on messages
alter table public.messages enable row level security;

-- Messages RLS Policies
drop policy if exists "Messages viewable by participants" on public.messages;
create policy "Messages viewable by participants" on public.messages
  for select using (
    auth.uid() = sender_id or
    auth.uid() = receiver_id or
    receiver_id is null or
    exists (
      select 1 from public.tasks t
      where t.id = messages.task_id and (t.client_id = auth.uid() or t.assigned_to_id = auth.uid())
    ) or
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "Messages can be inserted" on public.messages;
create policy "Messages can be inserted" on public.messages
  for insert with check (
    auth.uid() = sender_id
  );

-- Enable Realtime for live WebSocket messages
alter table public.messages replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
    ) then
      alter publication supabase_realtime add table public.messages;
    end if;
  end if;
end $$;

-- 3. CREATE REVIEWS TABLE IF NOT EXISTS
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  author_name text not null,
  target_user_id uuid references public.profiles(id) on delete cascade not null,
  rating numeric(2, 1) not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (task_id, author_id)
);

create index if not exists idx_reviews_task_id on public.reviews(task_id);
create index if not exists idx_reviews_target_user_id on public.reviews(target_user_id);

alter table public.reviews enable row level security;

drop policy if exists "Reviews viewable by everyone" on public.reviews;
create policy "Reviews viewable by everyone" on public.reviews
  for select using (true);

drop policy if exists "Reviews can be inserted" on public.reviews;
create policy "Reviews can be inserted" on public.reviews
  for insert with check (
    auth.uid() = author_id
  );

-- 4. CREATE PERFORMER SUBSCRIPTIONS TABLE IF NOT EXISTS
create table if not exists public.performer_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_type text not null,
  amount_paid_dh numeric(10, 2) not null,
  starts_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  status text default 'ACTIVE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_subscriptions_user_id on public.performer_subscriptions(user_id);

alter table public.performer_subscriptions enable row level security;

drop policy if exists "Users view own subscriptions" on public.performer_subscriptions;
create policy "Users view own subscriptions" on public.performer_subscriptions
  for select using (
    auth.uid() = user_id or 
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 5. CREATE TASK EXECUTIONS (CAMPAIGN SLOTS) TABLE IF NOT EXISTS
create table if not exists public.task_executions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  performer_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'RESERVED',
  reserved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reserved_until timestamp with time zone not null,
  submitted_at timestamp with time zone,
  report_text text,
  proof_urls text[] default '{}',
  anti_spam_entered text,
  client_feedback text,
  reviewed_at timestamp with time zone,
  unit_reward_dh numeric(10, 2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_task_executions_task_id on public.task_executions(task_id);
create index if not exists idx_task_executions_performer_id on public.task_executions(performer_id);

alter table public.task_executions enable row level security;

drop policy if exists "Task executions viewable by participants" on public.task_executions;
create policy "Task executions viewable by participants" on public.task_executions
  for select using (
    auth.uid() = performer_id or
    exists (select 1 from public.tasks t where t.id = task_executions.task_id and t.client_id = auth.uid()) or
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );
