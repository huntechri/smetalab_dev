DO $$ BEGIN
 CREATE TYPE "public"."project_receipt_status" AS ENUM('confirmed', 'pending', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."project_receipt_type" AS ENUM('advance', 'stage_payment', 'partial_payment', 'final_payment', 'additional_payment', 'adjustment', 'refund');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"project_id" uuid NOT NULL,
	"receipt_date" date NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"type" "project_receipt_type" DEFAULT 'partial_payment' NOT NULL,
	"status" "project_receipt_status" DEFAULT 'confirmed' NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_receipts" ADD CONSTRAINT "project_receipts_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_receipts" ADD CONSTRAINT "project_receipts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_receipts_tenant_project_date_idx" ON "project_receipts" USING btree ("tenant_id","project_id","receipt_date") WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_receipts_tenant_project_status_idx" ON "project_receipts" USING btree ("tenant_id","project_id","status") WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_receipts_tenant_updated_idx" ON "project_receipts" USING btree ("tenant_id","updated_at" DESC NULLS LAST) WHERE deleted_at IS NULL;