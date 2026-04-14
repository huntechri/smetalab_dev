CREATE TYPE "public"."project_status" AS ENUM('planned', 'active', 'completed', 'paused');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"counterparty_id" uuid,
	"customer_name" text,
	"contract_amount" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" "project_status" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DROP INDEX "activity_logs_tenant_user_timestamp_idx";--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_counterparty_id_counterparties_id_fk" FOREIGN KEY ("counterparty_id") REFERENCES "public"."counterparties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_tenant_status_idx" ON "projects" USING btree ("tenant_id","status") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "projects_counterparty_idx" ON "projects" USING btree ("counterparty_id");--> statement-breakpoint
CREATE INDEX "projects_name_trgm_idx" ON "projects" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "activity_logs_team_timestamp_idx" ON "activity_logs" USING btree ("team_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "impersonation_sessions_superadmin_idx" ON "impersonation_sessions" USING btree ("superadmin_user_id");--> statement-breakpoint
CREATE INDEX "impersonation_sessions_team_idx" ON "impersonation_sessions" USING btree ("target_team_id");