CREATE INDEX IF NOT EXISTS "estimate_rows_tenant_estimate_kind_updated_idx"
ON "estimate_rows" USING btree ("tenant_id", "estimate_id", "kind", "updated_at" DESC)
WHERE "kind" = 'material';

CREATE INDEX IF NOT EXISTS "estimate_execution_rows_tenant_estimate_order_idx"
ON "estimate_execution_rows" USING btree ("tenant_id", "estimate_id", "order")
WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "global_purchases_tenant_project_updated_idx"
ON "global_purchases" USING btree ("tenant_id", "project_id", "updated_at" DESC)
WHERE "deleted_at" IS NULL;
