CREATE TYPE "public"."global_purchase_source" AS ENUM('manual', 'catalog');--> statement-breakpoint
CREATE TABLE "global_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"project_name" varchar(160) DEFAULT '' NOT NULL,
	"material_name" text DEFAULT '' NOT NULL,
	"unit" varchar(20) DEFAULT 'шт' NOT NULL,
	"qty" double precision DEFAULT 1 NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"source" "global_purchase_source" DEFAULT 'manual' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "global_purchases" ADD CONSTRAINT "global_purchases_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "global_purchases_tenant_order_idx" ON "global_purchases" USING btree ("tenant_id","order") WHERE "global_purchases"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "global_purchases_tenant_updated_at_idx" ON "global_purchases" USING btree ("tenant_id","updated_at" desc) WHERE "global_purchases"."deleted_at" IS NULL;
