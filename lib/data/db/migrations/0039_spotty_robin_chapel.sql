DROP INDEX "materials_tenant_code_idx";--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "sort_order" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
WITH ordered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "tenant_id"
      ORDER BY "code" ASC, "id" ASC
    ) * 100 AS "new_sort_order"
  FROM "materials"
  WHERE "deleted_at" IS NULL
)
UPDATE "materials" AS m
SET "sort_order" = ordered."new_sort_order"
FROM ordered
WHERE m."id" = ordered."id"
  AND m."sort_order" = 0;--> statement-breakpoint
CREATE INDEX "materials_sort_order_idx" ON "materials" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "materials_tenant_sort_order_idx" ON "materials" USING btree ("tenant_id","sort_order") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "materials_tenant_deleted_sort_order_idx" ON "materials" USING btree ("tenant_id","deleted_at","sort_order");
