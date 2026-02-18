CREATE TABLE "estimate_room_params" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"estimate_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"perimeter" double precision DEFAULT 0 NOT NULL,
	"height" double precision DEFAULT 0 NOT NULL,
	"floor_area" double precision DEFAULT 0 NOT NULL,
	"ceiling_area" double precision DEFAULT 0 NOT NULL,
	"ceiling_slopes" double precision DEFAULT 0 NOT NULL,
	"doors_count" double precision DEFAULT 0 NOT NULL,
	"wall_segments" double precision DEFAULT 0 NOT NULL,
	"windows" jsonb NOT NULL,
	"portals" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "material_suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"color" varchar(7) DEFAULT '#3B82F6' NOT NULL,
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
ALTER TABLE "estimate_rows" ADD COLUMN "material_id" uuid;--> statement-breakpoint
ALTER TABLE "global_purchases" ADD COLUMN "supplier_id" uuid;--> statement-breakpoint
ALTER TABLE "global_purchases" ADD COLUMN "material_id" uuid;--> statement-breakpoint
ALTER TABLE "estimate_room_params" ADD CONSTRAINT "estimate_room_params_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_room_params" ADD CONSTRAINT "estimate_room_params_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_suppliers" ADD CONSTRAINT "material_suppliers_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "estimate_room_params_tenant_estimate_idx" ON "estimate_room_params" USING btree ("tenant_id","estimate_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "estimate_room_params_estimate_order_idx" ON "estimate_room_params" USING btree ("estimate_id","order") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "material_suppliers_tenant_updated_idx" ON "material_suppliers" USING btree ("tenant_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "material_suppliers_name_trgm_idx" ON "material_suppliers" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "material_suppliers_address_trgm_idx" ON "material_suppliers" USING gin ("address" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "material_suppliers_inn_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","inn");--> statement-breakpoint
CREATE INDEX "material_suppliers_ogrn_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","ogrn");--> statement-breakpoint
CREATE INDEX "material_suppliers_phone_trgm_idx" ON "material_suppliers" USING gin ("phone" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "material_suppliers_email_trgm_idx" ON "material_suppliers" USING gin ("email" gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "material_suppliers_company_inn_kpp_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","inn","kpp") WHERE deleted_at IS NULL AND legal_status = 'company';--> statement-breakpoint
CREATE UNIQUE INDEX "material_suppliers_individual_inn_tenant_idx" ON "material_suppliers" USING btree ("tenant_id","inn") WHERE deleted_at IS NULL AND legal_status = 'individual';--> statement-breakpoint
ALTER TABLE "estimate_rows" ADD CONSTRAINT "estimate_rows_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "global_purchases" ADD CONSTRAINT "global_purchases_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "estimate_rows_material_id_idx" ON "estimate_rows" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "global_purchases_tenant_supplier_date_idx" ON "global_purchases" USING btree ("tenant_id","supplier_id","purchase_date") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "global_purchases_material_id_idx" ON "global_purchases" USING btree ("material_id") WHERE deleted_at IS NULL;