-- ============================================================================
-- SabiProfile Sovereign Node Schema: User Cloud Integrations
-- Migration: 20261022000000_user_cloud_integrations.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_cloud_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uuid UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google_drive', 'dropbox')),
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  drive_folder_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cloud_user_provider ON user_cloud_integrations (user_uuid, provider);
CREATE INDEX IF NOT EXISTS idx_cloud_user ON user_cloud_integrations (user_uuid);

ALTER TABLE user_cloud_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cloud integrations"
  ON user_cloud_integrations FOR SELECT
  USING (user_uuid = auth.uid());

CREATE POLICY "Users can insert own cloud integrations"
  ON user_cloud_integrations FOR INSERT
  WITH CHECK (user_uuid = auth.uid());

CREATE POLICY "Users can update own cloud integrations"
  ON user_cloud_integrations FOR UPDATE
  USING (user_uuid = auth.uid());

