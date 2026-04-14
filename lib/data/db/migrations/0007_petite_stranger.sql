CREATE TYPE "public"."counterparty_type" AS ENUM('customer', 'contractor', 'supplier');--> statement-breakpoint
CREATE TYPE "public"."legal_status" AS ENUM('individual', 'company');--> statement-breakpoint
CREATE TABLE "counterparties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "counterparty_type" NOT NULL,
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
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "counterparties" ADD CONSTRAINT "counterparties_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "counterparties_tenant_idx" ON "counterparties" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "counterparties_name_idx" ON "counterparties" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "counterparties_inn_idx" ON "counterparties" USING btree ("inn");