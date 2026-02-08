-- Helper function for user team resolution
CREATE OR REPLACE FUNCTION get_user_team_id(target_user_id integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id
  FROM team_members
  WHERE user_id = target_user_id
  ORDER BY joined_at
  LIMIT 1;
$$;
--> statement-breakpoint

-- Drizzle generated migrations (consolidated)
DROP INDEX IF EXISTS "materials_tenant_unit_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "works_tenant_sort_order_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "works_tenant_unit_idx";--> statement-breakpoint
ALTER TABLE "materials" ALTER COLUMN "unit" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "works" ALTER COLUMN "unit" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "name_norm" text;--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "name_norm" text;--> statement-breakpoint

-- Backfill name_norm
UPDATE "materials" SET "name_norm" = LOWER("name") WHERE "name_norm" IS NULL;--> statement-breakpoint
UPDATE "works" SET "name_norm" = LOWER("name") WHERE "name_norm" IS NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "activity_logs_user_timestamp_idx" ON "activity_logs" USING btree ("user_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_team_id_idx" ON "invitations" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "materials_tenant_code_idx" ON "materials" USING btree ("tenant_id","code") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_created_at_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "materials_tenant_unit_idx" ON "materials" USING btree ("tenant_id","unit") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "works_tenant_sort_order_idx" ON "works" USING btree ("tenant_id","sort_order") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "works_tenant_unit_idx" ON "works" USING btree ("tenant_id","unit") WHERE deleted_at IS NULL;--> statement-breakpoint

-- New Index for name_norm search optimization
CREATE INDEX IF NOT EXISTS "materials_name_norm_trgm_idx" ON "materials" USING gin ("name_norm" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "works_name_norm_trgm_idx" ON "works" USING gin ("name_norm" gin_trgm_ops);--> statement-breakpoint

-- Row Level Security
ALTER TABLE "works" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "materials" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "estimate_shares" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY superadmin_all_works ON "works" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY global_read_works ON "works" FOR SELECT USING (tenant_id = 1);--> statement-breakpoint
CREATE POLICY tenant_isolation_works ON "works" FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

CREATE POLICY superadmin_all_materials ON "materials" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY global_read_materials ON "materials" FOR SELECT USING (tenant_id = 1);--> statement-breakpoint
CREATE POLICY tenant_isolation_materials ON "materials" FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

CREATE POLICY superadmin_all_activity_logs ON "activity_logs" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY tenant_isolation_activity_logs ON "activity_logs" FOR ALL USING (team_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

CREATE POLICY superadmin_all_notifications ON "notifications" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY tenant_isolation_notifications ON "notifications" FOR ALL USING (team_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

CREATE POLICY superadmin_all_estimate_shares ON "estimate_shares" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY tenant_isolation_estimate_shares ON "estimate_shares" FOR ALL USING (team_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

CREATE POLICY superadmin_all_invitations ON "invitations" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY tenant_isolation_invitations ON "invitations" FOR ALL USING (team_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);--> statement-breakpoint

CREATE POLICY superadmin_all_team_members ON "team_members" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY tenant_isolation_team_members ON "team_members" FOR ALL USING (team_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (team_id = current_setting('app.tenant_id', true)::integer);
