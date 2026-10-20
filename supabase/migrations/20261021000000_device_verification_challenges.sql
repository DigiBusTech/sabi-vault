-- ====================================================================
-- SABIPROFILE: DEVICE VERIFICATION CHALLENGES MIGRATION
-- Multi-Device Verification & Authorization on Concurrent Login
-- ====================================================================

CREATE TABLE IF NOT EXISTS device_verification_challenges (
    id TEXT PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'completed' | 'expired'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_challenges_user ON device_verification_challenges(user_uuid, status);
CREATE INDEX IF NOT EXISTS idx_device_challenges_expires ON device_verification_challenges(expires_at);

ALTER TABLE device_verification_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_challenges_service_role_only"
    ON device_verification_challenges
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
