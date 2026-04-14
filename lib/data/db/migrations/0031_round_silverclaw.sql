ALTER TABLE "estimate_rows"
ADD COLUMN "match_key" text NOT NULL DEFAULT '';

ALTER TABLE "global_purchases"
ADD COLUMN "match_key" text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION set_estimate_rows_match_key()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.match_key := COALESCE(NEW.material_id::text, lower(btrim(NEW.name)));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION set_global_purchases_match_key()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.match_key := COALESCE(NEW.material_id::text, lower(btrim(NEW.material_name)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS estimate_rows_match_key_trigger ON "estimate_rows";
CREATE TRIGGER estimate_rows_match_key_trigger
BEFORE INSERT OR UPDATE OF material_id, name
ON "estimate_rows"
FOR EACH ROW
EXECUTE FUNCTION set_estimate_rows_match_key();

DROP TRIGGER IF EXISTS global_purchases_match_key_trigger ON "global_purchases";
CREATE TRIGGER global_purchases_match_key_trigger
BEFORE INSERT OR UPDATE OF material_id, material_name
ON "global_purchases"
FOR EACH ROW
EXECUTE FUNCTION set_global_purchases_match_key();

UPDATE "estimate_rows"
SET "match_key" = COALESCE("material_id"::text, lower(btrim("name")));

UPDATE "global_purchases"
SET "match_key" = COALESCE("material_id"::text, lower(btrim("material_name")));

CREATE INDEX "estimate_rows_tenant_estimate_kind_match_key_idx"
ON "estimate_rows" USING btree ("tenant_id", "estimate_id", "kind", "match_key")
WHERE "deleted_at" IS NULL AND "kind" = 'material';

CREATE INDEX "global_purchases_tenant_project_match_key_purchase_date_idx"
ON "global_purchases" USING btree ("tenant_id", "project_id", "match_key", "purchase_date")
WHERE "deleted_at" IS NULL;

CREATE TABLE "estimate_procurement_cache" (
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

ALTER TABLE "estimate_procurement_cache" ADD CONSTRAINT "estimate_procurement_cache_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "estimate_procurement_cache" ADD CONSTRAINT "estimate_procurement_cache_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "estimate_procurement_cache" ADD CONSTRAINT "estimate_procurement_cache_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;

CREATE UNIQUE INDEX "estimate_procurement_cache_tenant_estimate_match_key_unique" ON "estimate_procurement_cache" USING btree ("tenant_id", "estimate_id", "match_key");
CREATE INDEX "estimate_procurement_cache_tenant_estimate_idx" ON "estimate_procurement_cache" USING btree ("tenant_id", "estimate_id") WHERE "deleted_at" IS NULL;
