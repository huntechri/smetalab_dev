ALTER TABLE "material_suppliers"
ADD COLUMN IF NOT EXISTS "color" varchar(7) DEFAULT '#3B82F6' NOT NULL;
--> statement-breakpoint

ALTER TABLE "global_purchases"
ADD COLUMN IF NOT EXISTS "supplier_id" uuid;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "global_purchases"
    ADD CONSTRAINT "global_purchases_supplier_id_material_suppliers_id_fk"
    FOREIGN KEY ("supplier_id") REFERENCES "public"."material_suppliers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "global_purchases_tenant_supplier_date_idx"
ON "global_purchases" USING btree ("tenant_id", "supplier_id", "purchase_date")
WHERE "global_purchases"."deleted_at" IS NULL;
