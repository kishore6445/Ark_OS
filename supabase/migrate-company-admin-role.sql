-- Run this in Supabase SQL editor on existing databases
-- Purpose: migrate role value from dept_admin -> company_admin

DO $$
DECLARE
  has_dept_admin BOOLEAN;
  has_company_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'dept_admin'
  ) INTO has_dept_admin;

  SELECT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'company_admin'
  ) INTO has_company_admin;

  IF has_dept_admin AND NOT has_company_admin THEN
    ALTER TYPE user_role RENAME VALUE 'dept_admin' TO 'company_admin';
  ELSIF has_dept_admin AND has_company_admin THEN
    UPDATE users
    SET role = 'company_admin'
    WHERE role = 'dept_admin';
  ELSIF NOT has_dept_admin AND NOT has_company_admin THEN
    ALTER TYPE user_role ADD VALUE 'company_admin';
  END IF;
END $$;
