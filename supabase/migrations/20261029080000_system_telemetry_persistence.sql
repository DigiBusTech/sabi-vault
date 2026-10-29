-- ==============================================================================
-- Migration: 20261029080000_system_telemetry_persistence.sql
-- Description: Persistent Enterprise System Telemetry Engine with 48h (2-day)
--              retention lifecycle for SabiProfile Mission Control
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_telemetry_events (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  iso_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subsystem TEXT NOT NULL,
  level TEXT NOT NULL,
  action TEXT NOT NULL,
  duration_ms INTEGER DEFAULT 0,
  status_code INTEGER,
  error_code TEXT,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- High-performance indexes for live telemetry dashboard queries and 2-day pruning
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON system_telemetry_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_subsystem ON system_telemetry_events (subsystem);
CREATE INDEX IF NOT EXISTS idx_telemetry_level ON system_telemetry_events (level);
CREATE INDEX IF NOT EXISTS idx_telemetry_action ON system_telemetry_events (action);

-- Enable Row Level Security
ALTER TABLE system_telemetry_events ENABLE ROW LEVEL SECURITY;

-- 1. Service role has full permissions for ingestion, query, and pruning
-- (All telemetry is ingested and queried server-side via createAdminSupabaseClient)
DROP POLICY IF EXISTS "Service role full access on system_telemetry_events" ON system_telemetry_events;
CREATE POLICY "Service role full access on system_telemetry_events"
  ON system_telemetry_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Optional: If organization_members exists in this database instance, grant authenticated admin read
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'organization_members'
  ) THEN
    DROP POLICY IF EXISTS "Admins can view system_telemetry_events" ON system_telemetry_events;
    CREATE POLICY "Admins can view system_telemetry_events"
      ON system_telemetry_events
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE public.organization_members.auth_user_id = auth.uid()
          AND public.organization_members.role IN ('ADMIN', 'AUDITOR')
        )
      );
  END IF;
END $$;

-- Database function to prune events older than 2 days (48 hours)
CREATE OR REPLACE FUNCTION purge_expired_telemetry_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM system_telemetry_events
  WHERE created_at < NOW() - INTERVAL '2 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
