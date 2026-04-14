CREATE INDEX IF NOT EXISTS "estimate_rows_estimate_tenant_deleted_order_idx"
ON "estimate_rows" ("estimate_id", "tenant_id", "deleted_at", "order");
