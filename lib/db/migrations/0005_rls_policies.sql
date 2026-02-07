-- Enable Row Level Security
ALTER TABLE "works" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "materials" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "estimate_shares" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════
-- WORKS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Bypass for superadmins
CREATE POLICY superadmin_all_works ON "works"
    FOR ALL
    USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint

-- Read access for everyone to global items (tenant_id = 1)
CREATE POLICY global_read_works ON "works"
    FOR SELECT
    USING (tenant_id = 1);--> statement-breakpoint

-- Tenant isolation
CREATE POLICY tenant_isolation_works ON "works"
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::integer)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════
-- MATERIALS POLICIES
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY superadmin_all_materials ON "materials"
    FOR ALL
    USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint

CREATE POLICY global_read_materials ON "materials"
    FOR SELECT
    USING (tenant_id = 1);--> statement-breakpoint

CREATE POLICY tenant_isolation_materials ON "materials"
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::integer)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════
-- ACTIVITY LOGS POLICIES
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY superadmin_all_activity_logs ON "activity_logs"
    FOR ALL
    USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint

CREATE POLICY tenant_isolation_activity_logs ON "activity_logs"
    FOR ALL
    USING (team_id = current_setting('app.tenant_id', true)::integer)
    WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS POLICIES
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY superadmin_all_notifications ON "notifications"
    FOR ALL
    USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint

CREATE POLICY tenant_isolation_notifications ON "notifications"
    FOR ALL
    USING (team_id = current_setting('app.tenant_id', true)::integer)
    WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════
-- ESTIMATE SHARES POLICIES
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY superadmin_all_estimate_shares ON "estimate_shares"
    FOR ALL
    USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint

CREATE POLICY tenant_isolation_estimate_shares ON "estimate_shares"
    FOR ALL
    USING (team_id = current_setting('app.tenant_id', true)::integer)
    WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════
-- INVITATIONS POLICIES
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY superadmin_all_invitations ON "invitations"
    FOR ALL
    USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint

CREATE POLICY tenant_isolation_invitations ON "invitations"
    FOR ALL
    USING (team_id = current_setting('app.tenant_id', true)::integer)
    WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════
-- TEAM MEMBERS POLICIES
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY superadmin_all_team_members ON "team_members"
    FOR ALL
    USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint

CREATE POLICY tenant_isolation_team_members ON "team_members"
    FOR ALL
    USING (team_id = current_setting('app.tenant_id', true)::integer)
    WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);
