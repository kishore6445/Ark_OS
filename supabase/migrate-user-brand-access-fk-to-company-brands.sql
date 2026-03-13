-- Align user_brand_access.brand_id with company_brands(id)
-- Run this in Supabase SQL editor.

BEGIN;

ALTER TABLE user_brand_access
  DROP CONSTRAINT IF EXISTS user_brand_access_brand_id_fkey;

ALTER TABLE user_brand_access
  ADD CONSTRAINT user_brand_access_brand_id_fkey
  FOREIGN KEY (brand_id)
  REFERENCES company_brands(id)
  ON DELETE CASCADE
  NOT VALID;

COMMIT;

-- Optional after cleaning legacy rows (if any):
-- ALTER TABLE user_brand_access VALIDATE CONSTRAINT user_brand_access_brand_id_fkey;
