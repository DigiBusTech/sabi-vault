-- Keep organization membership identifiers tied to Supabase Auth.
ALTER TABLE organization_members
    DROP CONSTRAINT IF EXISTS organization_members_auth_user_id_fkey;

ALTER TABLE organization_members
    ADD CONSTRAINT organization_members_auth_user_id_fkey
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    NOT VALID;

ALTER TABLE organization_members
    VALIDATE CONSTRAINT organization_members_auth_user_id_fkey;

CREATE INDEX IF NOT EXISTS idx_organization_members_auth_user
    ON organization_members(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_org_user
    ON organization_members(org_id, auth_user_id);

ALTER TABLE notaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_members_view ON organizations;
CREATE POLICY org_members_view ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM organization_members om
            WHERE om.org_id = organizations.id
              AND om.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS org_members_select ON organization_members;
CREATE POLICY org_members_select ON organization_members
    FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS notaries_public_read ON notaries;
CREATE POLICY notaries_public_read ON notaries
    FOR SELECT USING (is_authorized = TRUE);
