-- Platform configuration store for the Super Admin control plane.
-- Values are AES-256-GCM encrypted at rest (key derived from the Supabase
-- service role secret, which never leaves the server environment).
-- RLS is enabled with NO anon/auth policies: only the service role can read
-- or write configuration, and only through server-side API routes gated by
-- super-admin authentication.

CREATE TABLE IF NOT EXISTS platform_config (
    key              TEXT PRIMARY KEY,
    value_encrypted  TEXT NOT NULL,
    is_sensitive     BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by       TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- updated_at maintenance
CREATE OR REPLACE FUNCTION touch_platform_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS platform_config_touch ON platform_config;
CREATE TRIGGER platform_config_touch
    BEFORE UPDATE ON platform_config
    FOR EACH ROW
    EXECUTE FUNCTION touch_platform_config_updated_at();
