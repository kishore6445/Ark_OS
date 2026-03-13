-- Align victory_targets.brand_id with company_brands(id)
-- Run this in Supabase SQL editor.

BEGIN;

ALTER TABLE victory_targets
  DROP CONSTRAINT IF EXISTS victory_targets_brand_id_fkey;

ALTER TABLE victory_targets
  ADD CONSTRAINT victory_targets_brand_id_fkey
  FOREIGN KEY (brand_id)
  REFERENCES company_brands(id)
  ON DELETE CASCADE
  NOT VALID;

COMMIT;

-- Optional after cleaning legacy rows (if any):
-- ALTER TABLE victory_targets VALIDATE CONSTRAINT victory_targets_brand_id_fkey;
