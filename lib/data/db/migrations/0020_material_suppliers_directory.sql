CREATE TABLE IF NOT EXISTS "material_suppliers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" integer NOT NULL,
  "name" text NOT NULL,
  "legal_status" "legal_status" NOT NULL,
  "birth_date" varchar(20),
  "passport_series_number" varchar(50),
  "passport_issued_by" text,
  "passport_issued_date" varchar(20),
  "department_code" varchar(20),
  "ogrn" varchar(50),
  "inn" varchar(50),
  "kpp" varchar(50),
  "address" text,
  "phone" varchar(50),
  "email" varchar(255),
  "bank_name" text,
  "bank_account" varchar(50),
  "corr_account" varchar(50),
  "bank_inn" varchar(50),
  "bank_kpp" varchar(50),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "material_suppliers" ADD CONSTRAINT "material_suppliers_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "material_suppliers_tenant_updated_idx" ON "material_suppliers" USING btree ("tenant_id","updated_at" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "material_suppliers_name_trgm_idx" ON "material_suppliers" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "material_suppliers_address_trgm_idx" ON "material_suppliers" USING gin ("address" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "material_suppliers_inn_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","inn");
CREATE INDEX IF NOT EXISTS "material_suppliers_ogrn_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","ogrn");
CREATE INDEX IF NOT EXISTS "material_suppliers_phone_trgm_idx" ON "material_suppliers" USING gin ("phone" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "material_suppliers_email_trgm_idx" ON "material_suppliers" USING gin ("email" gin_trgm_ops);
CREATE UNIQUE INDEX IF NOT EXISTS "material_suppliers_company_inn_kpp_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","inn","kpp") WHERE deleted_at IS NULL AND legal_status = 'company';
CREATE UNIQUE INDEX IF NOT EXISTS "material_suppliers_individual_inn_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","inn") WHERE deleted_at IS NULL AND legal_status = 'individual';
