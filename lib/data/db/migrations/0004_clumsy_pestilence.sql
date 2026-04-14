DROP INDEX "activity_logs_user_timestamp_idx";--> statement-breakpoint
DROP INDEX "notifications_user_created_at_idx";--> statement-breakpoint
ALTER TABLE "materials" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "works" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "activity_logs_tenant_user_timestamp_idx" ON "activity_logs" USING btree ("team_id","user_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notifications_team_user_created_at_idx" ON "notifications" USING btree ("team_id","user_id","created_at" DESC NULLS LAST);