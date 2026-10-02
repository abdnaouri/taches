-- ====================================================================
-- SUPABASE SCHEMA FOR TÂCHES.MA (WORK-ZILLA + UNU HYBRID)
-- IDEMPOTENT & READY FOR EXECUTION IN SUPABASE SQL EDITOR
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. ENUMS (Safe creation with exception handling)
do $$ begin
  create type user_role as enum ('CUSTOMER', 'PERFORMER');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type task_status as enum ('DRAFT', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'COMPLETED', 'ARBITRATION', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type task_category as enum ('assistance', 'copywriting', 'design', 'development', 'marketing', 'micro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type performer_tier as enum ('level_1', 'level_2', 'level_3', 'level_4', 'level_5');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tx_type as enum ('DEPOSIT', 'WITHDRAWAL', 'ESCROW_LOCK', 'ESCROW_RELEASE', 'REFUND', 'COMMISSION');
exception when duplicate_object then null;
end $$;

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  avatar_url text,
  active_role user_role default 'CUSTOMER',
  balance_available numeric(12, 2) default 0.00 check (balance_available >= 0),
  balance_escrow numeric(12, 2) default 0.00 check (balance_escrow >= 0),
  is_admin boolean default false,
  
  -- Performer stats & badges
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

  -- Extended Professional Profile
  headline text,
  bio text,
  city text default 'Casablanca',
  phone text,
  whatsapp_enabled boolean default true,
  cin text,
  cin_verified boolean default false,
  languages jsonb default '[]'::jsonb,
  skills text[] default '{}',
  specialized_categories text[] default '{}',
  min_task_reward numeric(10, 2) default 30.00,
  is_available_for_hire boolean default true,

  -- Moroccan Bank Payout Details
  bank_name text default 'CIH Bank',
  bank_rib text,
  bank_account_holder text,

  -- Portfolio & Certifications
  portfolio jsonb default '[]'::jsonb,
  certifications jsonb default '[]'::jsonb,

  -- Notification Preferences
  notify_whatsapp boolean default true,
  notify_email boolean default true,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Idempotent column additions for existing profiles table
alter table public.profiles add column if not exists headline text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists city text default 'Casablanca';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists whatsapp_enabled boolean default true;
alter table public.profiles add column if not exists cin text;
alter table public.profiles add column if not exists cin_verified boolean default false;
alter table public.profiles add column if not exists languages jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists skills text[] default '{}';
alter table public.profiles add column if not exists specialized_categories text[] default '{}';
alter table public.profiles add column if not exists min_task_reward numeric(10, 2) default 30.00;
alter table public.profiles add column if not exists is_available_for_hire boolean default true;
alter table public.profiles add column if not exists bank_name text default 'CIH Bank';
alter table public.profiles add column if not exists bank_rib text;
alter table public.profiles add column if not exists bank_account_holder text;
alter table public.profiles add column if not exists portfolio jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists certifications jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists notify_whatsapp boolean default true;
alter table public.profiles add column if not exists notify_email boolean default true;
alter table public.profiles add column if not exists cin_document_front_url text;
alter table public.profiles add column if not exists cin_document_back_url text;
alter table public.profiles add column if not exists kyc_status text default 'UNVERIFIED';
alter table public.profiles add column if not exists kyc_submitted_at timestamp with time zone;
alter table public.profiles add column if not exists kyc_rejection_reason text;

-- 4. TASKS TABLE
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
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

  -- Execution mode & multi-task support
  task_mode text default 'single', -- 'single' | 'multi'
  unit_price_dh numeric(10, 2),
  target_executions_count integer default 1,
  city text default 'Casablanca',
  anti_spam_keyword text,

  -- Client metadata
  client_id uuid references public.profiles(id) on delete set null,
  client_name text default 'Client',
  client_avatar text default 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
  client_rating numeric(3, 2) default 5.00,
  client_hire_rate integer default 100,

  -- Performer assignment
  assigned_to_id uuid references public.profiles(id) on delete set null,
  assigned_to_name text,
  assigned_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Idempotent column additions for existing tasks table
alter table public.tasks add column if not exists task_mode text default 'single';
alter table public.tasks add column if not exists unit_price_dh numeric(10, 2);
alter table public.tasks add column if not exists target_executions_count integer default 1;
alter table public.tasks add column if not exists city text default 'Casablanca';
alter table public.tasks add column if not exists anti_spam_keyword text;

-- 5. BIDS / APPLICATIONS TABLE
create table if not exists public.bids (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  performer_id uuid references public.profiles(id) on delete cascade not null,
  pitch text not null,
  proposed_hours integer default 24,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (task_id, performer_id)
);

-- 6. TASK SUBMISSIONS / PROOFS
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  performer_id uuid references public.profiles(id) on delete cascade not null,
  report_text text not null,
  proof_urls text[] default '{}',
  client_feedback text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REAL-TIME TASK MESSAGES (CHAT)
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

-- 8. REVIEWS & RATINGS
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

-- 9. WALLET TRANSACTIONS LEDGER
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type tx_type not null,
  amount numeric(12, 2) not null,
  currency text default 'EUR',
  description text not null,
  status text default 'COMPLETED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. STORAGE BUCKETS SETUP
insert into storage.buckets (id, name, public) 
values ('proofs-and-deliverables', 'proofs-and-deliverables', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 11. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.bids enable row level security;
alter table public.submissions enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.transactions enable row level security;

-- Profiles Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert profiles" on public.profiles;
create policy "Users can insert profiles" on public.profiles
  for insert with check (auth.uid() = id);

-- Tasks Policies
drop policy if exists "Public tasks viewable by all" on public.tasks;
create policy "Public tasks viewable by all" on public.tasks
  for select using (true);

drop policy if exists "Authenticated users can create tasks" on public.tasks;
create policy "Authenticated users can create tasks" on public.tasks
  for insert with check (auth.uid() = client_id);

drop policy if exists "Clients can update their tasks" on public.tasks;
create policy "Clients can update their tasks" on public.tasks
  for update using (auth.uid() = client_id or auth.uid() = assigned_to_id);

-- Bids Policies
drop policy if exists "Bids viewable by everyone" on public.bids;
create policy "Bids viewable by everyone" on public.bids
  for select using (true);

drop policy if exists "Performers can place bids" on public.bids;
create policy "Performers can place bids" on public.bids
  for insert with check (auth.uid() = performer_id);

drop policy if exists "Performers can update their own bids" on public.bids;
create policy "Performers can update their own bids" on public.bids
  for update using (auth.uid() = performer_id);

-- Submissions Policies
drop policy if exists "Submissions viewable by everyone" on public.submissions;
drop policy if exists "Submissions viewable by participants" on public.submissions;
create policy "Submissions viewable by participants" on public.submissions
  for select using (
    auth.uid() = performer_id or
    exists (
      select 1 from public.tasks t
      where t.id = submissions.task_id and t.client_id = auth.uid()
    ) or
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "Performers can place submissions" on public.submissions;
create policy "Performers can place submissions" on public.submissions
  for insert with check (auth.uid() = performer_id);

-- Messages Policies (Strict Chat Privacy)
drop policy if exists "Messages viewable by participants" on public.messages;
create policy "Messages viewable by participants" on public.messages
  for select using (
    auth.uid() = sender_id or
    auth.uid() = receiver_id or
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
  for insert with check (auth.uid() = sender_id);

-- Reviews Policies
drop policy if exists "Reviews viewable by everyone" on public.reviews;
create policy "Reviews viewable by everyone" on public.reviews
  for select using (true);

drop policy if exists "Reviews can be inserted" on public.reviews;
create policy "Reviews can be inserted" on public.reviews
  for insert with check (auth.uid() = author_id);

-- Transactions Policies (Strict Ledger Isolation)
drop policy if exists "Transactions are viewable" on public.transactions;
drop policy if exists "Users view own transactions" on public.transactions;
create policy "Users view own transactions" on public.transactions
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "Transactions can be inserted" on public.transactions;


-- 12. ATOMIC FINANCIAL PROCEDURES (RPCs) FOR SECURE ESCROW
-- A. Lock Escrow when Task is Created
create or replace function public.lock_task_escrow(
  p_user_id uuid,
  p_task_id uuid,
  p_amount numeric,
  p_description text
)
returns jsonb as $$
declare
  v_current_balance numeric;
  v_tx_id uuid;
begin
  select balance_available into v_current_balance
  from public.profiles where id = p_user_id for update;

  if v_current_balance < p_amount then
    return jsonb_build_object('success', false, 'error', 'Solde insuffisant pour bloquer le séquestre');
  end if;

  update public.profiles
  set 
    balance_available = balance_available - p_amount,
    balance_escrow = balance_escrow + p_amount,
    customer_tasks_posted = customer_tasks_posted + 1
  where id = p_user_id;

  insert into public.transactions (user_id, type, amount, currency, description, status)
  values (p_user_id, 'ESCROW_LOCK', p_amount, 'EUR', p_description, 'COMPLETED')
  returning id into v_tx_id;

  return jsonb_build_object('success', true, 'transaction_id', v_tx_id);
end;
$$ language plpgsql security definer;

-- B. Release Escrow to Performer and Record Commission
create or replace function public.release_task_escrow(
  p_task_id uuid,
  p_client_id uuid,
  p_performer_id uuid,
  p_reward numeric,
  p_commission numeric,
  p_total_budget numeric,
  p_rating numeric default null,
  p_comment text default null
)
returns jsonb as $$
declare
  v_net_reward numeric := p_reward - p_commission;
begin
  -- 1. Deduct customer's locked escrow
  update public.profiles
  set 
    balance_escrow = greatest(0.00, balance_escrow - p_total_budget),
    customer_total_spent = customer_total_spent + p_total_budget
  where id = p_client_id;

  -- 2. Credit performer's available balance
  update public.profiles
  set 
    balance_available = balance_available + v_net_reward,
    performer_completed_tasks = performer_completed_tasks + 1,
    performer_xp = performer_xp + 25
  where id = p_performer_id;

  -- 3. Mark task completed
  update public.tasks
  set 
    status = 'COMPLETED',
    completed_at = timezone('utc'::text, now())
  where id = p_task_id;

  -- 4. Record ledger transactions
  insert into public.transactions (user_id, type, amount, currency, description, status)
  values (p_performer_id, 'ESCROW_RELEASE', p_reward, 'EUR', 'Gains débloqués pour mission validée #' || substring(p_task_id::text from 1 for 8), 'COMPLETED');

  insert into public.transactions (user_id, type, amount, currency, description, status)
  values (p_performer_id, 'COMMISSION', -p_commission, 'EUR', 'Commission de service Tâches.ma (15%)', 'COMPLETED');

  -- 5. Record optional review
  if p_rating is not null and p_comment is not null and length(trim(p_comment)) > 0 then
    insert into public.reviews (task_id, author_id, author_name, target_user_id, rating, comment)
    values (p_task_id, p_client_id, 'Client', p_performer_id, p_rating, p_comment)
    on conflict (task_id, author_id) do nothing;
  end if;

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- C. Refund Escrow to Client when Task is Cancelled
create or replace function public.refund_task_escrow(
  p_task_id uuid,
  p_client_id uuid,
  p_amount numeric,
  p_description text
)
returns jsonb as $$
begin
  update public.profiles
  set 
    balance_escrow = greatest(0.00, balance_escrow - p_amount),
    balance_available = balance_available + p_amount
  where id = p_client_id;

  update public.tasks
  set status = 'CANCELLED'
  where id = p_task_id;

  insert into public.transactions (user_id, type, amount, currency, description, status)
  values (p_client_id, 'REFUND', p_amount, 'EUR', p_description, 'COMPLETED');

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- 13. AUTH TRIGGER (Auto-create profile when user signs up)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, active_role, balance_available, balance_escrow, passed_qualification)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'active_role', 'CUSTOMER')::user_role,
    0.00,
    0.00,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 14. SEED INITIAL DEMO PROFILE & REALISTIC TASKS
insert into public.profiles (id, email, full_name, avatar_url, active_role, balance_available, balance_escrow, city, headline, bio)
values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'aero@example.com',
  'Aero Mehdi',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
  'PERFORMER',
  285.50,
  75.00,
  'Casablanca',
  'Développeur Full-Stack & Intégrateur YouCan / Shopify',
  'Expert en automatisation, intégration web Next.js/Tailwind et création de tunnels de vente e-commerce au Maroc.'
) on conflict (id) do nothing;

insert into public.tasks (id, title, description, category, status, reward, platform_fee, total_budget, time_limit_hours, min_level_required, required_proofs, applicants_count, client_name, client_avatar, client_rating, client_hire_rate, city)
values
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380101',
  'Correction responsive Tailwind CSS & formulaire de contact Next.js',
  'Nous avons une landing page Next.js dont le menu mobile se chevauche sur iPhone 13/14 et le formulaire de contact nécessite une validation Zod avec envoi d''email via Resend. Code propre et testé requis.',
  'development',
  'OPEN',
  45.00,
  5.00,
  50.00,
  4,
  2,
  array['Lien vers la Pull Request GitHub ou commit vérifiable', 'Vidéo de 30s ou capture d''écran du menu sur viewport mobile (390px)'],
  3,
  'Studio Digital Paris',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
  4.90,
  98,
  'Casablanca'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380102',
  'Création d''un logo vectoriel minimaliste + favicon SVG pour startup IA',
  'Recherche d''un graphiste pour concevoir un logo moderne et épuré pour ''SynapseAI''. Palette sobre (noir/blanc + touche néon vert/lime). Livrables en SVG, PNG transparent haute résolution et favicon.ico.',
  'design',
  'OPEN',
  70.00,
  7.00,
  77.00,
  24,
  1,
  array['Fichiers sources vectoriels .SVG et .AI', 'Fichier favicon.ico et déclinaisons PNG transparentes (512x512)'],
  7,
  'Karim B. (Founder)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  5.00,
  100,
  'Rabat'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380103',
  'Recherche et qualification de 50 prospects B2B SaaS (LinkedIn + Emails)',
  'Collecter 50 contacts ciblés : Directeurs Marketing ou Growth de scale-ups e-commerce en France (> 20 salariés). Colonnes requises : Prénom, Nom, Poste exact, Entreprise, Profil LinkedIn, Email professionnel vérifié.',
  'assistance',
  'OPEN',
  32.00,
  3.50,
  35.50,
  12,
  1,
  array['Fichier Google Sheets ou CSV partagé avec 50 lignes complètes', 'Rapport de bounce rate vérifié (NeverBounce ou Dropcontact)'],
  5,
  'GrowthLab Agency',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  4.80,
  92,
  'Tanger'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380104',
  'Traduction & adaptation SEO Anglais -> Français pour 4 fiches produits',
  'Traduction humaine de 4 pages de descriptions d''accessoires high-tech (environ 1 200 mots au total). Respect du ton de marque premium et intégration naturelle des mots-clés fournis.',
  'copywriting',
  'IN_PROGRESS',
  28.00,
  3.00,
  31.00,
  6,
  1,
  array['Document Google Docs avec mode suggestion et texte final relu', 'Tableau récapitulatif des métadescriptions optimisées'],
  4,
  'ÉlectroShop Direct',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  4.70,
  89,
  'Marrakech'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380105',
  'Test utilisateur UX (Application mobile iOS) + Rapport d''évaluation',
  'Télécharger notre application TestFlight, effectuer un parcours d''inscription complet et d''achat simulé, et rédiger un retour clair sur les éventuels points de friction rencontrés.',
  'micro',
  'OPEN',
  18.00,
  2.00,
  20.00,
  2,
  1,
  array['3 captures d''écran des étapes clés', 'Rapport écrit structuré de 200 mots minimum décrivant l''expérience'],
  12,
  'Nox Fintech',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
  4.90,
  95,
  'Casablanca'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380106',
  'Détourage propre et ombrage réaliste de 12 photos de mobilier',
  'Photos de chaises et canapés sur fond d''atelier à détourer à la plume (pas de détourage automatique flou) et exporter sur fond blanc pur (RGB 255,255,255) avec ombre portée naturelle.',
  'design',
  'OPEN',
  35.00,
  3.50,
  38.50,
  8,
  1,
  array['Archive ZIP contenant les 12 fichiers PNG et PSD avec calques conservés'],
  6,
  'Mobilier & Co',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
  4.85,
  94,
  'Agadir'
)
on conflict (id) do nothing;

-- ====================================================================
-- 15. WORKZILLA & UNU ENGINE ENHANCEMENTS
-- ====================================================================

-- Idempotent column additions for profiles & tasks
alter table public.profiles add column if not exists subscription_active_until timestamp with time zone;
alter table public.profiles add column if not exists free_tasks_remaining integer default 3;

alter table public.tasks add column if not exists executions_approved_count integer default 0;
alter table public.tasks add column if not exists executions_reserved_count integer default 0;

-- A. PERFORMER SUBSCRIPTIONS TABLE (Workzilla Paid Access Model)
create table if not exists public.performer_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_type text not null, -- '1_MONTH', '3_MONTHS', '1_YEAR'
  amount_paid_dh numeric(10, 2) not null,
  starts_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  status text default 'ACTIVE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.performer_subscriptions enable row level security;

drop policy if exists "Users view own subscriptions" on public.performer_subscriptions;
create policy "Users view own subscriptions" on public.performer_subscriptions
  for select using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- B. TASK EXECUTIONS TABLE (UNU Crowd Campaign Multi-Task Slots)
create table if not exists public.task_executions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  performer_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'RESERVED', -- 'RESERVED', 'SUBMITTED', 'APPROVED', 'REWORK_REQUESTED', 'REJECTED', 'EXPIRED'
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

alter table public.task_executions enable row level security;

drop policy if exists "Task executions viewable by participants" on public.task_executions;
create policy "Task executions viewable by participants" on public.task_executions
  for select using (
    auth.uid() = performer_id or
    exists (select 1 from public.tasks t where t.id = task_executions.task_id and t.client_id = auth.uid()) or
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- C. ATOMIC RPC: PURCHASE PERFORMER SUBSCRIPTION
create or replace function public.purchase_performer_subscription(
  p_user_id uuid,
  p_plan_type text,
  p_amount_dh numeric
)
returns jsonb as $$
declare
  v_available numeric;
  v_amount_eur numeric := p_amount_dh / 10.0;
  v_duration interval;
  v_expires_at timestamp with time zone;
  v_sub_id uuid;
begin
  select balance_available into v_available from public.profiles where id = p_user_id for update;

  if v_available < v_amount_eur then
    return jsonb_build_object('success', false, 'error', 'Solde disponible insuffisant pour activer le pass.');
  end if;

  if p_plan_type = '1_MONTH' then
    v_duration := interval '30 days';
  elsif p_plan_type = '3_MONTHS' then
    v_duration := interval '90 days';
  elsif p_plan_type = '1_YEAR' then
    v_duration := interval '365 days';
  else
    v_duration := interval '30 days';
  end if;

  v_expires_at := timezone('utc'::text, now()) + v_duration;

  update public.profiles
  set 
    balance_available = balance_available - v_amount_eur,
    subscription_active_until = v_expires_at
  where id = p_user_id;

  insert into public.performer_subscriptions (user_id, plan_type, amount_paid_dh, expires_at, status)
  values (p_user_id, p_plan_type, p_amount_dh, v_expires_at, 'ACTIVE')
  returning id into v_sub_id;

  insert into public.transactions (user_id, type, amount, currency, description, status)
  values (p_user_id, 'COMMISSION', -v_amount_eur, 'EUR', 'Activation Pass Prestataire Vérifié (' || p_plan_type || ')', 'COMPLETED');

  return jsonb_build_object('success', true, 'subscription_id', v_sub_id, 'expires_at', v_expires_at);
end;
$$ language plpgsql security definer;

-- D. ATOMIC RPC: RESERVE SLOT IN MULTI-EXECUTION CAMPAIGN (UNU Model)
create or replace function public.reserve_task_slot(
  p_task_id uuid,
  p_performer_id uuid
)
returns jsonb as $$
declare
  v_task record;
  v_existing record;
  v_reserved_until timestamp with time zone;
  v_unit_dh numeric;
  v_execution_id uuid;
begin
  select * into v_task from public.tasks where id = p_task_id for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Mission introuvable.');
  end if;

  if v_task.task_mode != 'multi' then
    return jsonb_build_object('success', false, 'error', 'Cette mission n''est pas en mode multi-exécutions.');
  end if;

  -- Check if performer already has active or approved execution
  select * into v_existing from public.task_executions
  where task_id = p_task_id and performer_id = p_performer_id and status in ('RESERVED', 'SUBMITTED', 'APPROVED');

  if found then
    return jsonb_build_object('success', false, 'error', 'Vous avez déjà réservé ou complété cette mission.');
  end if;

  -- Check remaining slots
  if coalesce(v_task.executions_approved_count, 0) + coalesce(v_task.executions_reserved_count, 0) >= coalesce(v_task.target_executions_count, 1) then
    return jsonb_build_object('success', false, 'error', 'Toutes les places sont actuellement réservées ou complétées.');
  end if;

  v_unit_dh := coalesce(v_task.unit_price_dh, (v_task.reward * 10) / greatest(1, v_task.target_executions_count));
  v_reserved_until := timezone('utc'::text, now()) + interval '45 minutes';

  insert into public.task_executions (task_id, performer_id, status, reserved_until, unit_reward_dh)
  values (p_task_id, p_performer_id, 'RESERVED', v_reserved_until, v_unit_dh)
  returning id into v_execution_id;

  update public.tasks
  set executions_reserved_count = coalesce(executions_reserved_count, 0) + 1
  where id = p_task_id;

  return jsonb_build_object('success', true, 'execution_id', v_execution_id, 'reserved_until', v_reserved_until);
end;
$$ language plpgsql security definer;

-- E. ATOMIC RPC: APPROVE MULTI-EXECUTION SLOT
create or replace function public.approve_task_execution(
  p_execution_id uuid,
  p_client_id uuid
)
returns jsonb as $$
declare
  v_exec record;
  v_task record;
  v_unit_eur numeric;
  v_commission_eur numeric;
  v_net_eur numeric;
begin
  select * into v_exec from public.task_executions where id = p_execution_id for update;
  if not found or v_exec.status != 'SUBMITTED' then
    return jsonb_build_object('success', false, 'error', 'Exécution introuvable ou pas en attente de validation.');
  end if;

  select * into v_task from public.tasks where id = v_exec.task_id for update;
  if not found or v_task.client_id != p_client_id then
    return jsonb_build_object('success', false, 'error', 'Non autorisé à valider cette exécution.');
  end if;

  v_unit_eur := v_exec.unit_reward_dh / 10.0;
  v_commission_eur := v_unit_eur * 0.15;
  v_net_eur := v_unit_eur - v_commission_eur;

  -- 1. Deduct customer's escrow
  update public.profiles
  set 
    balance_escrow = greatest(0.00, balance_escrow - v_unit_eur),
    customer_total_spent = customer_total_spent + v_unit_eur
  where id = p_client_id;

  -- 2. Credit performer's balance
  update public.profiles
  set 
    balance_available = balance_available + v_net_eur,
    performer_completed_tasks = performer_completed_tasks + 1,
    performer_xp = performer_xp + 10
  where id = v_exec.performer_id;

  -- 3. Update execution status
  update public.task_executions
  set 
    status = 'APPROVED',
    reviewed_at = timezone('utc'::text, now())
  where id = p_execution_id;

  -- 4. Update task count
  update public.tasks
  set 
    executions_approved_count = coalesce(executions_approved_count, 0) + 1,
    executions_reserved_count = greatest(0, coalesce(executions_reserved_count, 0) - 1)
  where id = v_exec.task_id;

  -- 5. Ledger record
  insert into public.transactions (user_id, type, amount, currency, description, status)
  values (v_exec.performer_id, 'ESCROW_RELEASE', v_unit_eur, 'EUR', 'Rémunération micro-tâche #' || substring(v_exec.task_id::text from 1 for 8), 'COMPLETED');

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- F. ATOMIC RPC: PROCESS AUTO-APPROVALS AND TASK EXPIRATIONS (Workzilla + UNU Cron Engine)
create or replace function public.process_task_expirations()
returns jsonb as $$
declare
  v_auto_approved_count integer := 0;
  v_expired_reservations_count integer := 0;
  v_overdue_tasks_count integer := 0;
  r_task record;
  r_sub record;
  r_exec record;
begin
  -- 1. Auto-approve tasks under review > 72h
  for r_sub in
    select s.*, t.client_id, t.reward, t.platform_fee, t.total_budget
    from public.submissions s
    join public.tasks t on t.id = s.task_id
    where t.status = 'UNDER_REVIEW' and s.submitted_at < (timezone('utc'::text, now()) - interval '72 hours')
  loop
    perform public.release_task_escrow(
      r_sub.task_id,
      r_sub.client_id,
      r_sub.performer_id,
      r_sub.reward,
      r_sub.reward * 0.15,
      r_sub.total_budget,
      5.0,
      'Validation automatique du livrable après 72h sans réclamation.'
    );
    v_auto_approved_count := v_auto_approved_count + 1;
  end loop;

  -- 2. Release expired crowd slot reservations > 45min
  for r_exec in
    select * from public.task_executions
    where status = 'RESERVED' and reserved_until < timezone('utc'::text, now())
  loop
    update public.task_executions set status = 'EXPIRED' where id = r_exec.id;
    update public.tasks
    set executions_reserved_count = greatest(0, coalesce(executions_reserved_count, 0) - 1)
    where id = r_exec.task_id;
    v_expired_reservations_count := v_expired_reservations_count + 1;
  end loop;

  return jsonb_build_object(
    'success', true,
    'auto_approved_tasks', v_auto_approved_count,
    'expired_slot_reservations', v_expired_reservations_count
  );
end;
$$ language plpgsql security definer;

