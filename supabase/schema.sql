-- ====================================================================
-- SUPABASE SCHEMA FOR TÂCHES (WORK-ZILLA + UNU HYBRID)
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
create type user_role as enum ('CUSTOMER', 'PERFORMER');
create type task_status as enum ('DRAFT', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'COMPLETED', 'ARBITRATION', 'CANCELLED');
create type task_category as enum ('assistance', 'copywriting', 'design', 'development', 'marketing', 'micro');
create type performer_tier as enum ('level_1', 'level_2', 'level_3', 'level_4', 'level_5');
create type tx_type as enum ('DEPOSIT', 'WITHDRAWAL', 'ESCROW_LOCK', 'ESCROW_RELEASE', 'REFUND', 'COMMISSION');

-- 3. PROFILES TABLE (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  avatar_url text,
  active_role user_role default 'CUSTOMER',
  balance_available numeric(12, 2) default 0.00 check (balance_available >= 0),
  balance_escrow numeric(12, 2) default 0.00 check (balance_escrow >= 0),
  
  -- Performer fields
  performer_tier performer_tier default 'level_1',
  performer_xp integer default 0,
  performer_rating numeric(3, 2) default 5.00,
  performer_reviews_count integer default 0,
  performer_completed_tasks integer default 0,
  passed_qualification boolean default false,

  -- Customer fields
  customer_rating numeric(3, 2) default 5.00,
  customer_total_spent numeric(12, 2) default 0.00,
  customer_tasks_posted integer default 0,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TASKS TABLE
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  category task_category not null default 'assistance',
  status task_status not null default 'OPEN',
  reward numeric(10, 2) not null check (reward > 0),
  platform_fee numeric(10, 2) not null default 0.00,
  total_budget numeric(10, 2) not null check (total_budget >= reward),
  time_limit_hours integer not null default 24,
  min_level_required integer not null default 1,
  required_proofs text[] default '{}',
  applicants_count integer default 0,

  client_id uuid references public.profiles(id) on delete cascade not null,
  assigned_to_id uuid references public.profiles(id) on delete set null,
  assigned_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. BIDS / APPLICATIONS TABLE
create table public.bids (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  performer_id uuid references public.profiles(id) on delete cascade not null,
  pitch text not null,
  proposed_hours integer default 24,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (task_id, performer_id)
);

-- 6. TASK SUBMISSIONS / PROOFS
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  performer_id uuid references public.profiles(id) on delete cascade not null,
  report_text text not null,
  proof_urls text[] default '{}',
  client_feedback text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. WALLET TRANSACTIONS LEDGER
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type tx_type not null,
  amount numeric(12, 2) not null,
  currency text default 'EUR',
  description text not null,
  status text default 'COMPLETED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. STORAGE BUCKETS SETUP
insert into storage.buckets (id, name, public) 
values ('proofs-and-deliverables', 'proofs-and-deliverables', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 9. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.bids enable row level security;
alter table public.submissions enable row level security;
alter table public.transactions enable row level security;

-- Profiles: Public can read, user can update their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Tasks: Anyone can view open tasks, clients can insert/update their tasks
create policy "Public tasks viewable by all" on public.tasks for select using (true);
create policy "Authenticated users can create tasks" on public.tasks for insert with check (auth.uid() = client_id);
create policy "Clients can update their tasks" on public.tasks for update using (auth.uid() = client_id or auth.uid() = assigned_to_id);

-- Bids: Viewable by task owner and applicant
create policy "Bids viewable by client or bidder" on public.bids for select using (
  auth.uid() = performer_id or exists (select 1 from public.tasks where id = bids.task_id and client_id = auth.uid())
);
create policy "Performers can place bids" on public.bids for insert with check (auth.uid() = performer_id);

-- Transactions: Private to user
create policy "Users can view their transactions" on public.transactions for select using (auth.uid() = user_id);

-- 10. AUTH TRIGGER (Auto-create profile when user signs up)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, active_role, balance_available)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'CUSTOMER',
    100.00 -- Initial free sandbox test balance
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
