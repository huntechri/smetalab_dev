ALTER TABLE "global_purchases"
ADD COLUMN IF NOT EXISTS "project_id" uuid;
--> statement-breakpoint

ALTER TABLE "global_purchases"
ADD COLUMN IF NOT EXISTS "purchase_date" date DEFAULT CURRENT_DATE NOT NULL;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "global_purchases"
    ADD CONSTRAINT "global_purchases_project_id_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DROP INDEX IF EXISTS "global_purchases_tenant_order_idx";
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "global_purchases_tenant_purchase_date_order_idx"
ON "global_purchases" USING btree ("tenant_id","purchase_date","order")
WHERE "global_purchases"."deleted_at" IS NULL;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "global_purchases_tenant_project_date_idx"
ON "global_purchases" USING btree ("tenant_id","project_id","purchase_date")
WHERE "global_purchases"."deleted_at" IS NULL;
