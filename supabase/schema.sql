-- ====================================================================
-- SUPABASE SCHEMA FOR TÂCHES (WORK-ZILLA + UNU HYBRID)
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

-- Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (true);

drop policy if exists "Users can insert profiles" on public.profiles;
create policy "Users can insert profiles" on public.profiles for insert with check (true);

drop policy if exists "Public tasks viewable by all" on public.tasks;
create policy "Public tasks viewable by all" on public.tasks for select using (true);

drop policy if exists "Authenticated users can create tasks" on public.tasks;
create policy "Authenticated users can create tasks" on public.tasks for insert with check (true);

drop policy if exists "Clients can update their tasks" on public.tasks;
create policy "Clients can update their tasks" on public.tasks for update using (true);

drop policy if exists "Bids viewable by everyone" on public.bids;
create policy "Bids viewable by everyone" on public.bids for select using (true);

drop policy if exists "Performers can place bids" on public.bids;
create policy "Performers can place bids" on public.bids for insert with check (true);

drop policy if exists "Submissions viewable by everyone" on public.submissions;
create policy "Submissions viewable by everyone" on public.submissions for select using (true);

drop policy if exists "Performers can place submissions" on public.submissions;
create policy "Performers can place submissions" on public.submissions for insert with check (true);

drop policy if exists "Messages viewable by participants" on public.messages;
create policy "Messages viewable by participants" on public.messages for select using (true);

drop policy if exists "Messages can be inserted" on public.messages;
create policy "Messages can be inserted" on public.messages for insert with check (true);

drop policy if exists "Reviews viewable by everyone" on public.reviews;
create policy "Reviews viewable by everyone" on public.reviews for select using (true);

drop policy if exists "Reviews can be inserted" on public.reviews;
create policy "Reviews can be inserted" on public.reviews for insert with check (true);

drop policy if exists "Transactions are viewable" on public.transactions;
create policy "Transactions are viewable" on public.transactions for select using (true);

drop policy if exists "Transactions can be inserted" on public.transactions;
create policy "Transactions can be inserted" on public.transactions for insert with check (true);

-- 12. AUTH TRIGGER (Auto-create profile when user signs up)
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

-- 11. SEED INITIAL DEMO PROFILE & REALISTIC TASKS
insert into public.profiles (id, email, full_name, avatar_url, active_role, balance_available, balance_escrow)
values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'aero@example.com',
  'Aero Mehdi',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
  'PERFORMER',
  285.50,
  75.00
) on conflict (id) do nothing;

insert into public.tasks (id, title, description, category, status, reward, platform_fee, total_budget, time_limit_hours, min_level_required, required_proofs, applicants_count, client_name, client_avatar, client_rating, client_hire_rate)
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
  98
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
  100
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
  92
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
  89
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
  95
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
  94
)
on conflict (id) do nothing;
