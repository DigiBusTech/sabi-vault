-- ====================================================================
-- SABIPROFILE: ENTERPRISE-GRADE SECURITY SUITE MIGRATION
-- Single-Session Enforcement, Device Fingerprinting, Progressive Lockout,
-- and Security Audit Logging
-- ====================================================================
-- Patch History:
--   v1.0  2026-10-19  Initial implementation
--   v1.1  2026-10-19  GAP fixes: FK cascade, RLS policies, role/orgId
--                     persistence, absolute session expiry, IP rate limiting

-- 1. Devices & Active Sessions Table (Enforces 1 active device per user)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- GAP-6 fix: FK with cascade delete ensures NDPC/GDPR right-to-erasure is
    -- automatically honored — deleting a Supabase Auth user wipes all their sessions.
    user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- GAP-1 fix: Store role and org so token rotation preserves privileges.
    role TEXT NOT NULL DEFAULT 'citizen',
    org_id TEXT,
    device_fingerprint TEXT NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- GAP-8 fix: Absolute expiry prevents infinite rotation attacks.
    -- Session can rotate every 15 minutes but must be re-authenticated after 30 days.
    absolute_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for rapid lookup & token revocation
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_uuid ON user_sessions(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_uuid, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_hash ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device ON user_sessions(user_uuid, device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(absolute_expires_at);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- GAP-4 fix: Explicit RLS policies — only the service role (server-side code)
-- can access session records. Anon/authenticated users have zero direct access.
CREATE POLICY "user_sessions_service_role_only"
    ON user_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 2. Brute-Force Progressive Lockout Tracking Table
-- Tier 1: 3 attempts -> 60s
-- Tier 2: 6 attempts -> 1hr
-- Tier 3: 9 attempts -> 24hr
-- Tier 4: 12 attempts -> Permanent lockout (manual support verification)
CREATE TABLE IF NOT EXISTS login_security_state (
    identifier TEXT PRIMARY KEY, -- email or user_id (lowercased)
    failed_attempts INT DEFAULT 0,
    lockout_level INT DEFAULT 0, -- 0: Normal, 1: 60s, 2: 1hr, 3: 24hr, 4: Permanent
    locked_until TIMESTAMP WITH TIME ZONE,
    -- GAP-7 partial fix: Track IP separately for IP-level rate limiting
    last_ip_address TEXT,
    ip_attempt_count INT DEFAULT 0,
    ip_window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE login_security_state ENABLE ROW LEVEL SECURITY;

-- GAP-4 fix: Explicit RLS policies
CREATE POLICY "login_security_state_service_role_only"
    ON login_security_state
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 3. Security Audit & Device Anomaly Log
CREATE TABLE IF NOT EXISTS security_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_uuid UUID,
    identifier TEXT,
    event_type TEXT NOT NULL, -- 'NEW_DEVICE_LOGIN', 'SESSION_TERMINATED_CONCURRENT', 'LOCKOUT_TIER_TRIGGERED', 'BOT_TRAP_TRIGGERED', 'LOGOUT'
    device_fingerprint TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sec_audit_user ON security_audit_events(user_uuid);
CREATE INDEX IF NOT EXISTS idx_sec_audit_event ON security_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sec_audit_identifier ON security_audit_events(identifier);
CREATE INDEX IF NOT EXISTS idx_sec_audit_created ON security_audit_events(created_at DESC);

ALTER TABLE security_audit_events ENABLE ROW LEVEL SECURITY;

-- GAP-4 fix: Explicit RLS policies
CREATE POLICY "security_audit_events_service_role_only"
    ON security_audit_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- GAP-4 fix: Explicit RLS policies
CREATE POLICY "security_audit_events_service_role_only"
    ON security_audit_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

