ALTER TABLE "estimate_rows"
  ADD COLUMN "material_id" uuid,
  ADD CONSTRAINT "estimate_rows_material_id_materials_id_fk"
    FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "estimate_rows_material_id_idx" ON "estimate_rows" USING btree ("material_id");

ALTER TABLE "global_purchases"
  ADD COLUMN "material_id" uuid,
  ADD CONSTRAINT "global_purchases_material_id_materials_id_fk"
    FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "global_purchases_material_id_idx" ON "global_purchases" USING btree ("material_id") WHERE "deleted_at" IS NULL;
