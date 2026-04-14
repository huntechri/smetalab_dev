DO $$
BEGIN
  CREATE TYPE "public"."estimate_status" AS ENUM('draft', 'in_progress', 'approved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" "estimate_status" DEFAULT 'draft' NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'estimates_tenant_id_teams_id_fk'
      AND conrelid = 'estimates'::regclass
  ) THEN
    ALTER TABLE "estimates" ADD CONSTRAINT "estimates_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END
$$;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'estimates_project_id_projects_id_fk'
      AND conrelid = 'estimates'::regclass
  ) THEN
    ALTER TABLE "estimates" ADD CONSTRAINT "estimates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END
$$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimates_tenant_project_idx" ON "estimates" USING btree ("tenant_id","project_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimates_project_idx" ON "estimates" USING btree ("project_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimates_tenant_updated_at_idx" ON "estimates" USING btree ("tenant_id","updated_at" DESC NULLS LAST) WHERE deleted_at IS NULL;
