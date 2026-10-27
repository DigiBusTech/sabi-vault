-- SabiProfile: Scoped Keys Persistence & Audit Log Resilience Fix
-- Ensures raw_key is stored permanently in scoped_api_keys so keys never disappear in serverless.
-- Relaxes rigid constraints on enterprise_query_audits so queries across all sectors (finance, legal, custom, etc.) are always logged.

-- 1. Add raw_key column to scoped_api_keys if it doesn't exist
ALTER TABLE public.scoped_api_keys 
  ADD COLUMN IF NOT EXISTS raw_key TEXT;

-- 2. Relax screening_vertical check constraint on enterprise_query_audits
ALTER TABLE public.enterprise_query_audits 
  DROP CONSTRAINT IF EXISTS enterprise_query_audits_screening_vertical_check;

-- 3. Drop key_id foreign key constraint on enterprise_query_audits so audits never fail to record
ALTER TABLE public.enterprise_query_audits 
  DROP CONSTRAINT IF EXISTS enterprise_query_audits_key_id_fkey;

-- 4. Create performance indexes for instant dashboard audit and key lookups
CREATE INDEX IF NOT EXISTS idx_scoped_keys_vault_id ON public.scoped_api_keys(vault_id);
CREATE INDEX IF NOT EXISTS idx_query_audits_target_vault ON public.enterprise_query_audits(target_vault_id);
CREATE INDEX IF NOT EXISTS idx_query_audits_created_at ON public.enterprise_query_audits(created_at DESC);

-- 5. Ensure service_role has unrestricted access for admin inserts and user views
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scoped_api_keys' AND policyname = 'service_role_manage_all_scoped_keys'
  ) THEN
    CREATE POLICY service_role_manage_all_scoped_keys ON public.scoped_api_keys
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'enterprise_query_audits' AND policyname = 'service_role_manage_all_query_audits'
  ) THEN
    CREATE POLICY service_role_manage_all_query_audits ON public.enterprise_query_audits
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
