-- =====================================================
-- UPDATE COMPANY BRANDS TABLE
-- =====================================================
-- Remove brand_id and is_primary columns
-- Store brand information directly

-- Drop the existing table and recreate with new structure
DROP TABLE IF EXISTS company_brands CASCADE;

CREATE TABLE company_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  brand_name VARCHAR(255) NOT NULL, -- Brand name (e.g., "Warrior Systems", "Story Marketing")
  brand_slug VARCHAR(255) NOT NULL, -- Brand slug (e.g., "warrior-systems", "story-marketing")
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure each company-brand combination is unique
  UNIQUE(company_id, brand_slug)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_company_brands_company ON company_brands(company_id);
CREATE INDEX IF NOT EXISTS idx_company_brands_slug ON company_brands(brand_slug);

-- Add trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_company_brands_updated_at ON company_brands;
CREATE TRIGGER update_company_brands_updated_at BEFORE UPDATE ON company_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy - super_admins can manage company brands
ALTER TABLE company_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage company brands" ON company_brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
