-- Migration: 20261027160000_enterprise_crm_team_email_schema.sql
-- Enterprise Talent Pool CRM, Organization RBAC Team Members & Transactional Email System

-- 1. Enterprise Talent Pool CRM
CREATE TABLE IF NOT EXISTS public.enterprise_talent_pool (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    key_id_used TEXT,
    full_name TEXT NOT NULL,
    headline TEXT,
    avatar_url TEXT,
    residence_city TEXT,
    residence_country TEXT,
    nationality TEXT,
    sector TEXT NOT NULL,
    target_role_or_route TEXT,
    target_countries JSONB DEFAULT '[]'::jsonb,
    rubric_id TEXT,
    rubric_name TEXT,
    composite_score INT DEFAULT 0,
    verdict TEXT,
    integrity_status TEXT,
    on_chain_tx TEXT,
    scores_breakdown JSONB DEFAULT '{}'::jsonb,
    benchmark_results JSONB DEFAULT '[]'::jsonb,
    citations JSONB DEFAULT '[]'::jsonb,
    anomalies_detected JSONB DEFAULT '[]'::jsonb,
    work_history_summary JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    vault_documents JSONB DEFAULT '[]'::jsonb,
    tier2_deficits JSONB DEFAULT '[]'::jsonb,
    holistic_match_index JSONB DEFAULT '{}'::jsonb,
    pipeline_stage TEXT NOT NULL DEFAULT 'QUERIED',
    tags JSONB DEFAULT '[]'::jsonb,
    evaluator_notes JSONB DEFAULT '[]'::jsonb,
    assigned_to TEXT,
    assigned_to_name TEXT,
    first_queried_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_talent_pool_org ON public.enterprise_talent_pool(org_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_talent_pool_candidate ON public.enterprise_talent_pool(candidate_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_talent_pool_stage ON public.enterprise_talent_pool(org_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_enterprise_talent_pool_sector ON public.enterprise_talent_pool(org_id, sector);

-- 2. Enterprise Team Members (RBAC)
CREATE TABLE IF NOT EXISTS public.enterprise_team_members (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'CASE_OFFICER_RECRUITER',
    status TEXT NOT NULL DEFAULT 'INVITED',
    invited_by TEXT,
    invited_by_name TEXT,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    activation_token TEXT UNIQUE,
    permissions JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_org ON public.enterprise_team_members(org_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_email ON public.enterprise_team_members(email);
CREATE INDEX IF NOT EXISTS idx_enterprise_team_members_token ON public.enterprise_team_members(activation_token);

-- 3. Email Templates (Transactional Studio)
CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'SYSTEM',
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NOT NULL,
    available_variables JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);

-- 4. Email Dispatch Logs (Telemetry & Audit)
CREATE TABLE IF NOT EXISTS public.email_dispatch_logs (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT',
    provider TEXT NOT NULL DEFAULT 'SOVEREIGN_MOCK',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_dispatch_logs_template ON public.email_dispatch_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_dispatch_logs_recipient ON public.email_dispatch_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_dispatch_logs_sent_at ON public.email_dispatch_logs(sent_at DESC);

-- Enable RLS
ALTER TABLE public.enterprise_talent_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- Service Role Full Access Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enterprise_talent_pool' AND policyname = 'service_role_all_talent_pool') THEN
        CREATE POLICY service_role_all_talent_pool ON public.enterprise_talent_pool FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enterprise_team_members' AND policyname = 'service_role_all_team_members') THEN
        CREATE POLICY service_role_all_team_members ON public.enterprise_team_members FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'service_role_all_email_templates') THEN
        CREATE POLICY service_role_all_email_templates ON public.email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_dispatch_logs' AND policyname = 'service_role_all_dispatch_logs') THEN
        CREATE POLICY service_role_all_dispatch_logs ON public.email_dispatch_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;
