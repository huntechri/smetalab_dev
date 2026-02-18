DO $$ BEGIN
  CREATE TYPE "public"."estimate_execution_source" AS ENUM('from_estimate', 'extra');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."estimate_execution_status" AS ENUM('not_started', 'in_progress', 'done');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimate_execution_rows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" integer NOT NULL,
  "estimate_id" uuid NOT NULL,
  "estimate_row_id" uuid,
  "source" "estimate_execution_source" DEFAULT 'from_estimate' NOT NULL,
  "status" "estimate_execution_status" DEFAULT 'not_started' NOT NULL,
  "code" varchar(120) DEFAULT '' NOT NULL,
  "name" text NOT NULL,
  "unit" varchar(50) DEFAULT 'шт' NOT NULL,
  "planned_qty" double precision DEFAULT 0 NOT NULL,
  "planned_price" double precision DEFAULT 0 NOT NULL,
  "planned_sum" double precision DEFAULT 0 NOT NULL,
  "actual_qty" double precision DEFAULT 0 NOT NULL,
  "actual_price" double precision DEFAULT 0 NOT NULL,
  "actual_sum" double precision DEFAULT 0 NOT NULL,
  "is_completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp,
  "completed_by_user_id" integer,
  "order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_estimate_row_id_estimate_rows_id_fk" FOREIGN KEY ("estimate_row_id") REFERENCES "public"."estimate_rows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_completed_by_user_id_users_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "estimate_execution_rows_estimate_row_unique" ON "estimate_execution_rows" USING btree ("estimate_id","estimate_row_id") WHERE estimate_row_id IS NOT NULL AND deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_execution_rows_tenant_estimate_idx" ON "estimate_execution_rows" USING btree ("tenant_id","estimate_id") WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_execution_rows_estimate_order_idx" ON "estimate_execution_rows" USING btree ("estimate_id","order") WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_execution_rows_estimate_status_idx" ON "estimate_execution_rows" USING btree ("estimate_id","status") WHERE deleted_at IS NULL;
