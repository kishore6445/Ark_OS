-- Align power_moves.brand_id with company_brands(id)
-- Run this in Supabase SQL editor.

BEGIN;

ALTER TABLE power_moves
  DROP CONSTRAINT IF EXISTS power_moves_brand_id_fkey;

ALTER TABLE power_moves
  ADD CONSTRAINT power_moves_brand_id_fkey
  FOREIGN KEY (brand_id)
  REFERENCES company_brands(id)
  ON DELETE CASCADE
  NOT VALID;

COMMIT;

-- Optional after cleaning legacy rows (if any):
-- ALTER TABLE power_moves VALIDATE CONSTRAINT power_moves_brand_id_fkey;
