-- Add one-company-per-user support.
-- Super admins may remain global (company_id nullable for role = super_admin).

-- 1) Always create the column first.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add FK only if companies table exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'company_id'
  )
  AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'companies'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND constraint_name = 'users_company_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES public.companies(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);

-- Optional hard-rule at DB layer: non-super-admin users must have a company.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND constraint_name = 'users_company_required_except_super_admin'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_company_required_except_super_admin
      CHECK (role = 'super_admin' OR company_id IS NOT NULL);
  END IF;
END $$;
