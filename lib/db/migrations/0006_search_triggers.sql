-- Migration: Add triggers for name_norm and search_vector auto-population
-- These triggers automatically normalize names and build search vectors on INSERT/UPDATE

-- Enable unaccent extension for removing diacritical marks
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Helper function to normalize name (lowercase, trim, collapse whitespace, remove accents)
CREATE OR REPLACE FUNCTION normalize_name(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LOWER(TRIM(regexp_replace(unaccent(input), '\s+', ' ', 'g')));
$$;

-- Trigger function for materials
CREATE OR REPLACE FUNCTION materials_search_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Normalize name
  NEW.name_norm := normalize_name(NEW.name);
  
  -- Build search vector from name, vendor, description, and tags
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.name_norm, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(LOWER(NEW.vendor), '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(LOWER(NEW.description), '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(LOWER(array_to_string(NEW.tags, ' ')), '')), 'D');
  
  RETURN NEW;
END;
$$;

-- Trigger function for works
CREATE OR REPLACE FUNCTION works_search_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Normalize name
  NEW.name_norm := normalize_name(NEW.name);
  
  -- Build search vector from name, category, description, and tags
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.name_norm, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(LOWER(NEW.category), '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(LOWER(NEW.description), '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(LOWER(array_to_string(NEW.tags, ' ')), '')), 'D');
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS materials_search_update ON materials;
CREATE TRIGGER materials_search_update
  BEFORE INSERT OR UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION materials_search_trigger();

DROP TRIGGER IF EXISTS works_search_update ON works;
CREATE TRIGGER works_search_update
  BEFORE INSERT OR UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION works_search_trigger();

-- Backfill existing data
UPDATE materials SET name_norm = normalize_name(name) WHERE name_norm IS NULL OR name_norm != normalize_name(name);
UPDATE works SET name_norm = normalize_name(name) WHERE name_norm IS NULL OR name_norm != normalize_name(name);
