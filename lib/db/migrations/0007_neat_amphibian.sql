DROP INDEX IF EXISTS "activity_logs_tenant_user_timestamp_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_logs_team_timestamp_idx" ON "activity_logs" USING btree ("team_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "impersonation_sessions_superadmin_idx" ON "impersonation_sessions" USING btree ("superadmin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "impersonation_sessions_team_idx" ON "impersonation_sessions" USING btree ("target_team_id");