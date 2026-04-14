CREATE TABLE IF NOT EXISTS "estimate_room_params" (
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
DO $$ BEGIN
 ALTER TABLE "estimate_room_params" ADD CONSTRAINT "estimate_room_params_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_room_params" ADD CONSTRAINT "estimate_room_params_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_room_params_tenant_estimate_idx" ON "estimate_room_params" USING btree ("tenant_id","estimate_id") WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_room_params_estimate_order_idx" ON "estimate_room_params" USING btree ("estimate_id","order") WHERE deleted_at IS NULL;
