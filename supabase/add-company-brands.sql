-- =====================================================
-- COMPANY BRANDS ASSOCIATION TABLE
-- =====================================================
-- Allows super_admin to assign brands to companies
-- One company can have multiple brands

CREATE TABLE IF NOT EXISTS company_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Indicates the primary brand for this company
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure each company-brand combination is unique
  UNIQUE(company_id, brand_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_company_brands_company ON company_brands(company_id);
CREATE INDEX IF NOT EXISTS idx_company_brands_brand ON company_brands(brand_id);

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
