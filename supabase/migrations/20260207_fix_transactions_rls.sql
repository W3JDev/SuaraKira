-- ============================================================================
-- Migration: Fix Transaction RLS Policies
-- Date: 2026-02-07
-- Purpose: Add Row Level Security to transactions table to prevent data leakage
-- CRITICAL: This fixes a security vulnerability where users can see other accounts' data
-- ============================================================================

-- ============================================================================
-- PART 1: Enable RLS on transactions table
-- ============================================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: Drop existing policies (if any) to start fresh
-- ============================================================================

DROP POLICY IF EXISTS "Users can view transactions in their org" ON transactions;
DROP POLICY IF EXISTS "Staff can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all org transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update all org transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can delete all org transactions" ON transactions;

-- ============================================================================
-- PART 3: Create SELECT policies
-- ============================================================================

-- Policy 1: Staff can only view their own transactions
CREATE POLICY "Staff can view own transactions"
ON transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
    AND transactions.created_by = auth.uid()
  )
);

-- Policy 2: Admins can view all transactions in their organization
CREATE POLICY "Admins can view all org transactions"
ON transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND transactions.organization_id = profiles.organization_id
  )
);

-- Policy 3: Owners/Super admins can view all transactions in their organization
CREATE POLICY "Owners can view all org transactions"
ON transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('owner', 'super_admin')
    AND transactions.organization_id = profiles.organization_id
  )
);

-- ============================================================================
-- PART 4: Create INSERT policies
-- ============================================================================

-- Policy 4: Any authenticated user can insert transactions
-- BUT only for their own organization (enforced by trigger)
CREATE POLICY "Users can insert transactions"
ON transactions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND created_by = auth.uid()
  AND organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================================================
-- PART 5: Create UPDATE policies
-- ============================================================================

-- Policy 5: Staff can only update their own transactions
CREATE POLICY "Staff can update own transactions"
ON transactions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
    AND transactions.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
    AND transactions.created_by = auth.uid()
    AND transactions.organization_id = profiles.organization_id
  )
);

-- Policy 6: Admins can update all transactions in their organization
CREATE POLICY "Admins can update all org transactions"
ON transactions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'owner', 'super_admin')
    AND transactions.organization_id = profiles.organization_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'owner', 'super_admin')
    AND transactions.organization_id = profiles.organization_id
  )
);

-- ============================================================================
-- PART 6: Create DELETE policies
-- ============================================================================

-- Policy 7: Staff can delete their own transactions (within time window)
CREATE POLICY "Staff can delete own recent transactions"
ON transactions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
    AND transactions.created_by = auth.uid()
    -- Allow deletion within 24 hours
    AND transactions.created_at > NOW() - INTERVAL '24 hours'
  )
);

-- Policy 8: Admins can delete any transaction in their organization
CREATE POLICY "Admins can delete all org transactions"
ON transactions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'owner', 'super_admin')
    AND transactions.organization_id = profiles.organization_id
  )
);

-- ============================================================================
-- PART 7: Add trigger to auto-set organization_id from user's profile
-- ============================================================================

CREATE OR REPLACE FUNCTION set_transaction_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate organization_id from user's profile
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM profiles
    WHERE id = NEW.created_by;
  END IF;

  -- Auto-populate created_by if not set
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS set_transaction_organization_trigger ON transactions;
CREATE TRIGGER set_transaction_organization_trigger
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_organization();

-- ============================================================================
-- PART 8: Add indexes for RLS policy performance
-- ============================================================================

-- Index for created_by lookups (staff viewing own transactions)
CREATE INDEX IF NOT EXISTS idx_transactions_created_by
ON transactions(created_by);

-- Index for organization_id lookups (admin viewing org transactions)
CREATE INDEX IF NOT EXISTS idx_transactions_organization_id
ON transactions(organization_id);

-- Composite index for common RLS checks
CREATE INDEX IF NOT EXISTS idx_transactions_org_created_by
ON transactions(organization_id, created_by);

-- Index for time-based deletion policy
CREATE INDEX IF NOT EXISTS idx_transactions_created_at
ON transactions(created_at DESC);

-- ============================================================================
-- PART 9: Ensure profiles table also has RLS (if not already)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate profile policies
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their org"
ON profiles
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================================
-- PART 10: Add helpful comments
-- ============================================================================

COMMENT ON POLICY "Staff can view own transactions" ON transactions IS
  'Staff members can only see transactions they created themselves';

COMMENT ON POLICY "Admins can view all org transactions" ON transactions IS
  'Admins, owners, and super admins can see all transactions in their organization';

COMMENT ON POLICY "Users can insert transactions" ON transactions IS
  'Any authenticated user can create transactions, but only for their own organization';

COMMENT ON POLICY "Staff can update own transactions" ON transactions IS
  'Staff can only edit their own transactions';

COMMENT ON POLICY "Admins can update all org transactions" ON transactions IS
  'Admins can edit any transaction in their organization';

COMMENT ON POLICY "Staff can delete own recent transactions" ON transactions IS
  'Staff can delete their own transactions within 24 hours';

COMMENT ON POLICY "Admins can delete all org transactions" ON transactions IS
  'Admins can delete any transaction in their organization';

-- ============================================================================
-- PART 11: Verification query (for manual testing)
-- ============================================================================

-- Run this as a logged-in user to verify RLS is working:
-- SELECT COUNT(*) FROM transactions; -- Should only show YOUR transactions (staff) or org transactions (admin)

-- ============================================================================
-- PART 12: Add function to check RLS is working
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_rls_enabled()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname)
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename IN ('transactions', 'profiles', 'locations', 'files', 'audit_log')
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Migration complete
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'RLS SECURITY MIGRATION COMPLETED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Enabled RLS on: transactions, profiles';
  RAISE NOTICE 'Created policies for: SELECT, INSERT, UPDATE, DELETE';
  RAISE NOTICE 'Added auto-organization assignment trigger';
  RAISE NOTICE 'Added performance indexes for RLS';
  RAISE NOTICE '';
  RAISE NOTICE 'SECURITY RULES:';
  RAISE NOTICE '- Staff: Can only see/edit their OWN transactions';
  RAISE NOTICE '- Admins: Can see/edit ALL transactions in their organization';
  RAISE NOTICE '- Cross-organization data is completely isolated';
  RAISE NOTICE '';
  RAISE NOTICE 'To verify RLS is working:';
  RAISE NOTICE 'SELECT * FROM verify_rls_enabled();';
  RAISE NOTICE '============================================================';
END $$;
