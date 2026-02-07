-- Works: Add name_norm column
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "name_norm" text;

-- Works: Backfill name_norm and search_vector
UPDATE "works"
SET
  "name_norm" = trim(regexp_replace(lower(unaccent(coalesce("name", ''))), '\s+', ' ', 'g')),
  "search_vector" =
    setweight(to_tsvector('simple', unaccent(coalesce("name", ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce("code", ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce("phase", ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce("category", ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce("subcategory", ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(array_to_string("tags", ' '), ''))), 'D') ||
    setweight(to_tsvector('simple', unaccent(coalesce("description", ''))), 'D') ||
    setweight(to_tsvector('simple', unaccent(coalesce("short_description", ''))), 'D');

-- Works: Create trigger function
CREATE OR REPLACE FUNCTION works_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.name_norm := trim(regexp_replace(lower(unaccent(coalesce(NEW.name, ''))), '\s+', ' ', 'g'));
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.code, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.phase, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.category, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.subcategory, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(array_to_string(NEW.tags, ' '), ''))), 'D') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.description, ''))), 'D') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.short_description, ''))), 'D');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS works_search_vector_trigger ON "works";

CREATE TRIGGER works_search_vector_trigger
BEFORE INSERT OR UPDATE ON "works"
FOR EACH ROW
EXECUTE FUNCTION works_search_vector_trigger();