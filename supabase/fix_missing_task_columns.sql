-- ====================================================================
-- MIGRATION: ADD MISSING TASK & PROFILE COLUMNS + RELOAD SCHEMA CACHE
-- Project: vzrmunzfkftydvgmylvu
-- Run this script in the Supabase Dashboard -> SQL Editor:
-- https://supabase.com/dashboard/project/vzrmunzfkftydvgmylvu/sql
-- ====================================================================

-- 1. ADD MISSING COLUMNS TO PUBLIC.TASKS
alter table public.tasks add column if not exists sub_category text;
alter table public.tasks add column if not exists task_mode text default 'single';
alter table public.tasks add column if not exists unit_price_dh numeric(10, 2);
alter table public.tasks add column if not exists target_executions_count integer default 1;
alter table public.tasks add column if not exists city text default 'Casablanca';
alter table public.tasks add column if not exists anti_spam_keyword text;
alter table public.tasks add column if not exists executions_approved_count integer default 0;
alter table public.tasks add column if not exists executions_reserved_count integer default 0;
alter table public.tasks add column if not exists settlement_proposal jsonb;
alter table public.tasks add column if not exists final_payout_percentage numeric(5, 2);
alter table public.tasks add column if not exists final_performer_amount_dh numeric(10, 2);
alter table public.tasks add column if not exists final_client_refund_dh numeric(10, 2);

-- 2. ADD EXTENDED COLUMNS TO PUBLIC.PROFILES (FOR KYC & WORKER STATS)
alter table public.profiles add column if not exists headline text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists city text default 'Casablanca';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists whatsapp_enabled boolean default true;
alter table public.profiles add column if not exists cin text;
alter table public.profiles add column if not exists cin_verified boolean default false;
alter table public.profiles add column if not exists cin_document_front_url text;
alter table public.profiles add column if not exists cin_document_back_url text;
alter table public.profiles add column if not exists kyc_status text default 'UNVERIFIED';
alter table public.profiles add column if not exists kyc_submitted_at timestamp with time zone;
alter table public.profiles add column if not exists kyc_rejection_reason text;
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
alter table public.profiles add column if not exists subscription_active_until timestamp with time zone;
alter table public.profiles add column if not exists free_tasks_remaining integer default 3;

-- 3. RELOAD POSTGREST SCHEMA CACHE
notify pgrst, 'reload schema';
