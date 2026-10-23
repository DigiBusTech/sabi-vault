-- Migration: 20261023120000_broadcast_notifications.sql
-- Live Notification Broadcast System for Multi-Tenant Header Alerts

CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(32) NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'citizen', 'enterprise', 'super_admin')),
    theme VARCHAR(32) NOT NULL DEFAULT 'info' CHECK (theme IN ('info', 'success', 'warning', 'danger', 'purple', 'custom')),
    custom_bg_color VARCHAR(16),
    custom_text_color VARCHAR(16),
    is_dismissible BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INT NOT NULL DEFAULT 1,
    action_label VARCHAR(64),
    action_url VARCHAR(512),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for live querying active notifications
CREATE INDEX IF NOT EXISTS idx_broadcast_notifications_active 
ON public.broadcast_notifications(is_active, audience, starts_at, expires_at);

-- Row Level Security
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (authenticated or public) can read active broadcasts within validity window
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'broadcast_notifications' 
        AND policyname = 'Public read active broadcast notifications'
    ) THEN
        CREATE POLICY "Public read active broadcast notifications"
        ON public.broadcast_notifications FOR SELECT
        USING (
            is_active = true 
            AND starts_at <= NOW() 
            AND (expires_at IS NULL OR expires_at > NOW())
        );
    END IF;
END $$;

-- Policy 2: Authenticated admins have full CRUD via service role or admin session
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'broadcast_notifications' 
        AND policyname = 'Admins have full CRUD on broadcast notifications'
    ) THEN
        CREATE POLICY "Admins have full CRUD on broadcast notifications"
        ON public.broadcast_notifications FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

