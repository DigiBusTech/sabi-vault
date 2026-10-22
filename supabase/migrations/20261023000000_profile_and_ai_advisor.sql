-- SabiProfile: Human Profile, Persona Niches & Sovereign Target Advisor Migration
-- Regional Node Partitioning & Strict NDPC/GDPR Schema Definitions

-- 1. Update Vault Records Category Check Constraint to include 9 categories
ALTER TABLE IF EXISTS public.vault_records 
  DROP CONSTRAINT IF EXISTS vault_records_category_check;

ALTER TABLE IF EXISTS public.vault_records
  ADD CONSTRAINT vault_records_category_check 
  CHECK (category IN (
    'finance',
    'portfolio',
    'certifications',
    'academics',
    'experience',
    'achievements',
    'identification',
    'legal',
    'receipts'
  ));

-- 2. User Human Profiles Table
CREATE TABLE IF NOT EXISTS public.user_human_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  residence_city TEXT NOT NULL DEFAULT 'Lagos',
  residence_country TEXT NOT NULL DEFAULT 'Nigeria',
  nationality TEXT NOT NULL DEFAULT 'Nigerian',
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  hobbies JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_human_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own human profile"
  ON public.user_human_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Persona Niches (Zero-CV Studio)
CREATE TABLE IF NOT EXISTS public.user_profile_niches (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('job', 'relocation', 'academic', 'procurement', 'grant')),
  target_industry TEXT NOT NULL,
  headline TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  selected_skill_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_credential_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_synthesize_dossier BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_profile_niches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own niches"
  ON public.user_profile_niches
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Sovereign Target Goals
CREATE TABLE IF NOT EXISTS public.user_target_goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('job', 'relocation', 'academic', 'procurement')),
  title TEXT NOT NULL,
  target_country TEXT NOT NULL,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused')),
  required_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  min_liquid_funds_usd NUMERIC,
  min_years_experience NUMERIC,
  mandatory_credentials JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_target_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own target goals"
  ON public.user_target_goals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
