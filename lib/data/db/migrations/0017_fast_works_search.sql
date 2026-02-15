CREATE INDEX IF NOT EXISTS "works_tenant_active_category_idx"
  ON "works" USING btree ("tenant_id", "category")
  WHERE deleted_at IS NULL AND status = 'active';--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "works_name_norm_trgm_idx"
  ON "works" USING gin ("name_norm" gin_trgm_ops);
