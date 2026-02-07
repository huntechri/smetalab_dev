CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "name_norm" text;

UPDATE "materials"
SET
  "name_norm" = trim(regexp_replace(lower(unaccent(coalesce("name", ''))), '\s+', ' ', 'g')),
  "search_vector" =
    setweight(to_tsvector('simple', unaccent(coalesce("name", ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce("code", ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce("vendor", ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce("category_lv1", ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce("category_lv2", ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce("category_lv3", ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce("category_lv4", ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(array_to_string("tags", ' '), ''))), 'D') ||
    setweight(to_tsvector('simple', unaccent(coalesce("description", ''))), 'D');

CREATE OR REPLACE FUNCTION materials_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.name_norm := trim(regexp_replace(lower(unaccent(coalesce(NEW.name, ''))), '\s+', ' ', 'g'));
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.code, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.vendor, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.category_lv1, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.category_lv2, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.category_lv3, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.category_lv4, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(array_to_string(NEW.tags, ' '), ''))), 'D') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.description, ''))), 'D');
  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS materials_search_vector_trigger ON "materials";

CREATE TRIGGER materials_search_vector_trigger
BEFORE INSERT OR UPDATE ON "materials"
FOR EACH ROW
EXECUTE FUNCTION materials_search_vector_trigger();
