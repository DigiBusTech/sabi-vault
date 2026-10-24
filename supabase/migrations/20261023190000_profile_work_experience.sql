-- ============================================================================
-- SabiProfile Sovereign Node Schema: Work Experience Area Extension
-- Migration: 20261023190000_profile_work_experience.sql
-- ============================================================================

ALTER TABLE IF EXISTS public.user_human_profiles
  ADD COLUMN IF NOT EXISTS work_experiences JSONB NOT NULL DEFAULT '[]'::jsonb;

