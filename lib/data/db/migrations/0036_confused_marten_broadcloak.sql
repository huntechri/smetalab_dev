DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'estimate_row_kind' AND e.enumlabel = 'section') THEN
        ALTER TYPE "public"."estimate_row_kind" ADD VALUE 'section' BEFORE 'work';
    END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "object_address" text;