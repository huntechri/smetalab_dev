DO $$
BEGIN
  CREATE TYPE "public"."estimate_row_kind" AS ENUM('work', 'material');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimate_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"estimate_id" uuid NOT NULL,
	"kind" "estimate_row_kind" DEFAULT 'work' NOT NULL,
	"parent_work_id" uuid,
	"code" varchar(120) NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"unit" varchar(50) NOT NULL,
	"qty" double precision DEFAULT 1 NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"sum" double precision DEFAULT 0 NOT NULL,
	"expense" double precision DEFAULT 0 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
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
    WHERE conname = 'estimate_rows_tenant_id_teams_id_fk'
      AND conrelid = 'estimate_rows'::regclass
  ) THEN
    ALTER TABLE "estimate_rows" ADD CONSTRAINT "estimate_rows_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END
$$;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'estimate_rows_estimate_id_estimates_id_fk'
      AND conrelid = 'estimate_rows'::regclass
  ) THEN
    ALTER TABLE "estimate_rows" ADD CONSTRAINT "estimate_rows_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END
$$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_rows_estimate_order_idx" ON "estimate_rows" USING btree ("estimate_id","order") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_rows_tenant_estimate_idx" ON "estimate_rows" USING btree ("tenant_id","estimate_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_rows_parent_idx" ON "estimate_rows" USING btree ("parent_work_id") WHERE deleted_at IS NULL;
