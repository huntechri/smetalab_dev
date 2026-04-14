CREATE INDEX IF NOT EXISTS "materials_tenant_active_category_idx"
  ON "materials" USING btree ("tenant_id", "category_lv1")
  WHERE deleted_at IS NULL AND status = 'active';--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "materials_name_norm_trgm_idx"
  ON "materials" USING gin ("name_norm" gin_trgm_ops);
