CREATE TABLE IF NOT EXISTS "estimate_procurement_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"estimate_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"match_key" text NOT NULL,
	"material_name" text NOT NULL,
	"unit" varchar(50) DEFAULT 'шт' NOT NULL,
	"source" varchar(20) NOT NULL,
	"planned_qty" double precision DEFAULT 0 NOT NULL,
	"planned_price" double precision DEFAULT 0 NOT NULL,
	"planned_amount" double precision DEFAULT 0 NOT NULL,
	"actual_qty" double precision DEFAULT 0 NOT NULL,
	"actual_avg_price" double precision DEFAULT 0 NOT NULL,
	"actual_amount" double precision DEFAULT 0 NOT NULL,
	"qty_delta" double precision DEFAULT 0 NOT NULL,
	"amount_delta" double precision DEFAULT 0 NOT NULL,
	"purchase_count" integer DEFAULT 0 NOT NULL,
	"last_purchase_date" date,
	"refreshed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "estimate_rows" ADD COLUMN IF NOT EXISTS "match_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "execution_sync_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "execution_synced_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "global_purchases" ADD COLUMN IF NOT EXISTS "match_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "code_sort_key" text DEFAULT '~' NOT NULL;--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estimate_procurement_cache_tenant_id_teams_id_fk') THEN
        ALTER TABLE "estimate_procurement_cache" ADD CONSTRAINT "estimate_procurement_cache_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estimate_procurement_cache_estimate_id_estimates_id_fk') THEN
        ALTER TABLE "estimate_procurement_cache" ADD CONSTRAINT "estimate_procurement_cache_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estimate_procurement_cache_project_id_projects_id_fk') THEN
        ALTER TABLE "estimate_procurement_cache" ADD CONSTRAINT "estimate_procurement_cache_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "estimate_procurement_cache_tenant_estimate_match_key_unique" ON "estimate_procurement_cache" USING btree ("tenant_id","estimate_id","match_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_procurement_cache_tenant_estimate_idx" ON "estimate_procurement_cache" USING btree ("tenant_id","estimate_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_rows_estimate_tenant_deleted_order_idx" ON "estimate_rows" USING btree ("estimate_id","tenant_id","deleted_at","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_rows_tenant_estimate_kind_match_key_idx" ON "estimate_rows" USING btree ("tenant_id","estimate_id","kind","match_key") WHERE deleted_at IS NULL AND kind = 'material';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "global_purchases_tenant_project_match_key_purchase_date_idx" ON "global_purchases" USING btree ("tenant_id","project_id","match_key","purchase_date") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "works_tenant_deleted_code_sort_order_idx" ON "works" USING btree ("tenant_id","deleted_at","code_sort_key","sort_order");