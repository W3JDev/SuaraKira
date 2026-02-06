-- ============================================================================
-- SuaraKira Database Security Diagnostic Script
-- ============================================================================
-- Purpose: Check if Row Level Security is properly configured
-- Run this in Supabase SQL Editor to diagnose data isolation issues
-- ============================================================================

-- ============================================================================
-- CHECK 1: Verify RLS is enabled on critical tables
-- ============================================================================

SELECT
  '=== RLS STATUS ===' as check_type,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED - CRITICAL ISSUE!'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'profiles', 'organizations', 'locations', 'files', 'audit_log')
ORDER BY tablename;

-- ============================================================================
-- CHECK 2: Count RLS policies per table
-- ============================================================================

SELECT
  '=== POLICY COUNT ===' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) = 0 THEN '❌ NO POLICIES - DATA IS EXPOSED!'
    WHEN COUNT(*) < 3 THEN '⚠️ FEW POLICIES - MAY BE INCOMPLETE'
    ELSE '✅ POLICIES EXIST'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'profiles', 'organizations', 'locations', 'files', 'audit_log')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- CHECK 3: List all RLS policies on transactions table
-- ============================================================================

SELECT
  '=== TRANSACTIONS POLICIES ===' as check_type,
  policyname as policy_name,
  cmd as command,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_status,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'transactions'
ORDER BY cmd, policyname;

-- ============================================================================
-- CHECK 4: Verify your current user profile
-- ============================================================================

SELECT
  '=== YOUR PROFILE ===' as check_type,
  id as user_id,
  organization_id,
  role,
  full_name,
  CASE
    WHEN organization_id IS NULL THEN '❌ NO ORG - WILL SEE NO DATA!'
    ELSE '✅ ORG ASSIGNED'
  END as org_status
FROM profiles
WHERE id = auth.uid();

-- ============================================================================
-- CHECK 5: Count transactions visible to YOU (respects RLS)
-- ============================================================================

SELECT
  '=== YOUR VISIBLE TRANSACTIONS ===' as check_type,
  COUNT(*) as transaction_count,
  CASE
    WHEN COUNT(*) = 0 THEN '⚠️ No transactions visible (check org_id)'
    WHEN COUNT(*) > 1000 THEN '⚠️ Suspiciously high - RLS may not be working'
    ELSE '✅ Reasonable count'
  END as assessment
FROM transactions;

-- ============================================================================
-- CHECK 6: Count ALL transactions (bypasses RLS - admin view)
-- ============================================================================
-- NOTE: This only works if you have service_role access
-- If this returns different count than CHECK 5, RLS is working!

SELECT
  '=== TOTAL TRANSACTIONS (ALL ORGS) ===' as check_type,
  COUNT(*) as total_in_database
FROM transactions;

-- ============================================================================
-- CHECK 7: Check if transactions have organization_id set
-- ============================================================================

SELECT
  '=== ORGANIZATION COVERAGE ===' as check_type,
  COUNT(*) FILTER (WHERE organization_id IS NOT NULL) as with_org_id,
  COUNT(*) FILTER (WHERE organization_id IS NULL) as without_org_id,
  CASE
    WHEN COUNT(*) FILTER (WHERE organization_id IS NULL) > 0
    THEN '⚠️ Some transactions missing org_id - will be hidden by RLS'
    ELSE '✅ All transactions have org_id'
  END as status
FROM transactions;

-- ============================================================================
-- CHECK 8: Check if created_by is properly set
-- ============================================================================

SELECT
  '=== CREATED_BY COVERAGE ===' as check_type,
  COUNT(*) FILTER (WHERE created_by IS NOT NULL) as with_creator,
  COUNT(*) FILTER (WHERE created_by IS NULL) as without_creator,
  CASE
    WHEN COUNT(*) FILTER (WHERE created_by IS NULL) > 0
    THEN '⚠️ Some transactions missing created_by - may cause issues'
    ELSE '✅ All transactions have created_by'
  END as status
FROM transactions;

-- ============================================================================
-- CHECK 9: List all organizations in the database
-- ============================================================================

SELECT
  '=== ORGANIZATIONS ===' as check_type,
  id as org_id,
  name as org_name,
  (SELECT COUNT(*) FROM profiles WHERE organization_id = organizations.id) as user_count,
  (SELECT COUNT(*) FROM transactions WHERE organization_id = organizations.id) as transaction_count
FROM organizations
ORDER BY name;

-- ============================================================================
-- CHECK 10: Check for cross-organization data leakage test
-- ============================================================================
-- This query shows if RLS is properly isolating organizations

SELECT
  '=== ISOLATION TEST ===' as check_type,
  t.organization_id as transaction_org,
  p.organization_id as your_org,
  CASE
    WHEN t.organization_id = p.organization_id THEN '✅ Same org (OK)'
    WHEN t.organization_id != p.organization_id THEN '❌ DIFFERENT ORG - RLS BREACH!'
    WHEN t.organization_id IS NULL THEN '⚠️ Transaction has no org_id'
    ELSE 'Unknown'
  END as isolation_status,
  COUNT(*) as count
FROM transactions t
CROSS JOIN profiles p
WHERE p.id = auth.uid()
GROUP BY t.organization_id, p.organization_id
ORDER BY isolation_status;

-- ============================================================================
-- CHECK 11: Test if you can see other users' transactions (staff only)
-- ============================================================================

SELECT
  '=== STAFF ISOLATION TEST ===' as check_type,
  created_by as creator_id,
  CASE
    WHEN created_by = auth.uid() THEN '✅ Your own transaction'
    WHEN created_by != auth.uid() THEN '❌ SOMEONE ELSE''S - Should not see if you''re STAFF!'
    ELSE 'Unknown creator'
  END as ownership_status,
  COUNT(*) as count
FROM transactions
GROUP BY created_by
ORDER BY count DESC;

-- ============================================================================
-- CHECK 12: Final Security Assessment
-- ============================================================================

WITH security_check AS (
  SELECT
    -- Check if RLS is enabled
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'transactions') as rls_enabled,
    -- Check if policies exist
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'transactions') as policy_count,
    -- Check your role
    (SELECT role FROM profiles WHERE id = auth.uid()) as your_role,
    -- Check if you have org_id
    (SELECT organization_id FROM profiles WHERE id = auth.uid()) as your_org_id,
    -- Check transaction count
    (SELECT COUNT(*) FROM transactions) as visible_transactions
)
SELECT
  '=== FINAL ASSESSMENT ===' as check_type,
  CASE
    WHEN NOT rls_enabled THEN '🚨 CRITICAL: RLS is DISABLED - All data is exposed!'
    WHEN policy_count = 0 THEN '🚨 CRITICAL: No RLS policies - All data is exposed!'
    WHEN your_org_id IS NULL THEN '⚠️ WARNING: You have no organization - No data will be visible'
    WHEN your_role = 'staff' AND visible_transactions > 100 THEN '⚠️ WARNING: Staff user seeing too many transactions - RLS may not be working'
    WHEN rls_enabled AND policy_count >= 8 THEN '✅ SECURE: RLS is enabled with proper policies'
    ELSE '⚠️ PARTIAL: RLS is enabled but configuration may be incomplete'
  END as security_status,
  rls_enabled,
  policy_count,
  your_role,
  CASE WHEN your_org_id IS NOT NULL THEN 'Assigned' ELSE 'Missing' END as org_assignment,
  visible_transactions
FROM security_check;

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================

SELECT
  '=== RECOMMENDATIONS ===' as check_type,
  CASE
    WHEN NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'transactions')
    THEN '1. URGENT: Enable RLS on transactions table
2. Apply the migration: supabase/migrations/20260207_fix_transactions_rls.sql
3. Test again after applying migration'

    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'transactions') = 0
    THEN '1. URGENT: Create RLS policies on transactions table
2. Apply the migration: supabase/migrations/20260207_fix_transactions_rls.sql
3. Verify policies with: SELECT * FROM pg_policies WHERE tablename = ''transactions'''

    WHEN (SELECT organization_id FROM profiles WHERE id = auth.uid()) IS NULL
    THEN '1. Create or join an organization
2. Update your profile: UPDATE profiles SET organization_id = ''<org-uuid>'' WHERE id = auth.uid()
3. Refresh and test again'

    ELSE '✅ Your database security looks good!
- RLS is enabled
- Policies exist
- Your profile is configured
- Data isolation should be working

If you still see other users'' data:
1. Log out and log back in
2. Clear browser cache
3. Hard reload (Ctrl+Shift+R)
4. Check browser console for errors'
  END as action_items
FROM (SELECT 1) as dummy;

-- ============================================================================
-- END OF DIAGNOSTIC SCRIPT
-- ============================================================================
--
-- How to read the results:
-- - ✅ = Good, secure configuration
-- - ⚠️ = Warning, needs attention
-- - ❌ = Critical issue, fix immediately
--
-- If you see "❌ DISABLED - CRITICAL ISSUE" for RLS:
-- → Apply the migration immediately: 20260207_fix_transactions_rls.sql
--
-- If you see "❌ DIFFERENT ORG - RLS BREACH":
-- → RLS is not working, apply the migration
--
-- For more help, see: DATA_ISOLATION_FIX.md
-- ============================================================================
