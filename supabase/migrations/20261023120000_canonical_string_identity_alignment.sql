-- SabiProfile: Canonical String Identity Alignment for Profile/Advisor Tables
-- Fixes production OAuth failure: "invalid input syntax for type uuid: usr_xxx"
--
-- Root cause: migration 20261023000000 defined user_id as UUID REFERENCES
-- auth.users(id), but the platform's canonical identifier is the VARCHAR
-- string form (usr_...), consistent with vault_profiles.user_id VARCHAR(128)
-- in 20261013000000_sovereign_nodes_schema.sql. The OAuth callback and the
-- Sabi session tokens carry the canonical string ID, so every profile
-- read/write failed with a Postgres UUID cast error.
--
-- This migration converts all three tables to the canonical VARCHAR(128)
-- identity and re-binds RLS policies with an explicit auth.uid()::text cast.

-- 1. user_human_profiles
ALTER TABLE public.user_human_profiles
  DROP CONSTRAINT IF EXISTS user_human_profiles_user_id_fkey;
ALTER TABLE public.user_human_profiles
  ALTER COLUMN user_id TYPE VARCHAR(128) USING user_id::text;

DROP POLICY IF EXISTS "Users can manage own human profile" ON public.user_human_profiles;
CREATE POLICY "Users can manage own human profile"
  ON public.user_human_profiles
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 2. user_profile_niches
ALTER TABLE public.user_profile_niches
  DROP CONSTRAINT IF EXISTS user_profile_niches_user_id_fkey;
ALTER TABLE public.user_profile_niches
  ALTER COLUMN user_id TYPE VARCHAR(128) USING user_id::text;

DROP POLICY IF EXISTS "Users can manage own niches" ON public.user_profile_niches;
CREATE POLICY "Users can manage own niches"
  ON public.user_profile_niches
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 3. user_target_goals
ALTER TABLE public.user_target_goals
  DROP CONSTRAINT IF EXISTS user_target_goals_user_id_fkey;
ALTER TABLE public.user_target_goals
  ALTER COLUMN user_id TYPE VARCHAR(128) USING user_id::text;

DROP POLICY IF EXISTS "Users can manage own target goals" ON public.user_target_goals;
CREATE POLICY "Users can manage own target goals"
  ON public.user_target_goals
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
