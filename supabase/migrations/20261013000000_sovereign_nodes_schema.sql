-- ====================================================================
-- SABI VAULT: SOVEREIGN DATABASE NODES & PARTITIONING SCHEMA
-- Compliant with NDPC (Nigeria) & GDPR (European Union)
-- ====================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SOVEREIGN REGIONAL NODES REGISTRY
CREATE TABLE IF NOT EXISTS sovereign_nodes (
    node_id VARCHAR(64) PRIMARY KEY,
    region_name VARCHAR(128) NOT NULL,
    jurisdiction VARCHAR(64) NOT NULL,
    compliance_framework VARCHAR(32) NOT NULL CHECK (compliance_framework IN ('NDPC', 'GDPR', 'US_PRIVACY', 'GLOBAL_REST')),
    payout_wallet_address VARCHAR(42) NOT NULL, -- EVM address for 40% sovereign split
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Sovereign Hubs
INSERT INTO sovereign_nodes (node_id, region_name, jurisdiction, compliance_framework, payout_wallet_address)
VALUES 
    ('ng-west-africa', 'West Africa Sovereign Hub (Lagos / Abuja)', 'Nigeria / ECOWAS', 'NDPC', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'),
    ('eu-central', 'EU Central Sovereign Hub (Frankfurt / Dublin)', 'European Union', 'GDPR', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
    ('na-east', 'North America Sovereign Hub (N. Virginia)', 'United States / Canada', 'US_PRIVACY', '0x90F79bf6EB2c4f870365E785982E1f101E93b906')
ON CONFLICT (node_id) DO NOTHING;

-- 2. CITIZEN VAULT PROFILES
CREATE TABLE IF NOT EXISTS vault_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    citizenship_country VARCHAR(3) NOT NULL, -- ISO Alpha-3 or Alpha-2
    residence_country VARCHAR(3) NOT NULL,
    sovereign_node_id VARCHAR(64) NOT NULL REFERENCES sovereign_nodes(node_id),
    oauth_google_drive_connected BOOLEAN DEFAULT FALSE,
    oauth_last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STRUCTURED VAULT RECORDS (ZERO RAW PDFS STORED)
CREATE TABLE IF NOT EXISTS vault_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id VARCHAR(128) NOT NULL REFERENCES vault_profiles(user_id) ON DELETE CASCADE,
    category VARCHAR(32) NOT NULL CHECK (category IN ('finance', 'portfolio', 'certifications', 'academics', 'experience', 'achievements')),
    structured_json JSONB NOT NULL,
    sha256_hash CHAR(64) NOT NULL, -- SHA-256 digest of structured data or original file
    verification_tier SMALLINT NOT NULL DEFAULT 1 CHECK (verification_tier IN (1, 2)),
    on_chain_tx_hash VARCHAR(66),
    on_chain_committed_at TIMESTAMPTZ,
    notary_id VARCHAR(128),
    notary_seal_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (vault_id, category)
);

-- Index for instant hash verification
CREATE INDEX IF NOT EXISTS idx_vault_records_hash ON vault_records(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_vault_records_lookup ON vault_records(vault_id, category);

-- 4. SCOPED CRYPTOGRAPHIC API KEYS
CREATE TABLE IF NOT EXISTS scoped_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id VARCHAR(64) UNIQUE NOT NULL,
    vault_id VARCHAR(128) NOT NULL REFERENCES vault_profiles(user_id) ON DELETE CASCADE,
    allowed_scopes TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    max_queries INT NOT NULL DEFAULT 5,
    query_count INT NOT NULL DEFAULT 0,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scoped_keys_lookup ON scoped_api_keys(key_id);

-- 5. ENTERPRISE QUERY & REVENUE AUDIT LOGS
CREATE TABLE IF NOT EXISTS enterprise_query_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id VARCHAR(64) UNIQUE NOT NULL,
    key_id VARCHAR(64) REFERENCES scoped_api_keys(key_id),
    target_vault_id VARCHAR(128) NOT NULL,
    requesting_organization VARCHAR(255) NOT NULL,
    screening_vertical VARCHAR(32) NOT NULL CHECK (screening_vertical IN ('labour', 'immigration', 'education', 'enterprise')),
    accessed_scopes TEXT[] NOT NULL,
    tamper_check_passed BOOLEAN NOT NULL,
    composite_score NUMERIC(5,2),
    verdict VARCHAR(32),
    query_fee_usd NUMERIC(8,2) DEFAULT 1.00,
    platform_split_usd NUMERIC(8,2) DEFAULT 0.60,
    sovereign_host_split_usd NUMERIC(8,2) DEFAULT 0.40,
    sovereign_node_id VARCHAR(64) REFERENCES sovereign_nodes(node_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE vault_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoped_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_query_audits ENABLE ROW LEVEL SECURITY;

-- 1. Vault Profiles: Users can only see and edit their own profile
CREATE POLICY user_own_profile_select ON vault_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY user_own_profile_update ON vault_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 2. Vault Records: Users have complete control over their structured records
CREATE POLICY user_own_records_all ON vault_records
    FOR ALL USING (auth.uid()::text = vault_id);

-- 3. Scoped API Keys: Users can manage their issued keys
CREATE POLICY user_own_keys_all ON scoped_api_keys
    FOR ALL USING (auth.uid()::text = vault_id);

-- 4. Enterprise Audits: Read-only for involved user and organization
CREATE POLICY user_view_own_audits ON enterprise_query_audits
    FOR SELECT USING (auth.uid()::text = target_vault_id);

