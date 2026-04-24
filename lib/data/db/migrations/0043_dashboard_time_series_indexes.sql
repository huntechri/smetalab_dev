CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_exec_rows_tenant_created_at_active"
ON "estimate_execution_rows" USING btree ("tenant_id", "created_at")
WHERE "deleted_at" IS NULL;
--> statement-breakpoint

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_exec_rows_tenant_completed_at_active"
ON "estimate_execution_rows" USING btree ("tenant_id", "completed_at")
WHERE "deleted_at" IS NULL AND "completed_at" IS NOT NULL;
--> statement-breakpoint

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_estimate_rows_tenant_created_material_active"
ON "estimate_rows" USING btree ("tenant_id", "created_at")
WHERE "deleted_at" IS NULL AND "kind" = 'material';
--> statement-breakpoint

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_receipts_tenant_confirmed_date_active"
ON "project_receipts" USING btree ("tenant_id", "receipt_date")
WHERE "deleted_at" IS NULL AND "status" = 'confirmed';
