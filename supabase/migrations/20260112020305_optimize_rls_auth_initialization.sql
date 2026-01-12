/*
  # Optimize RLS Policies with Auth Initialization

  ## Changes
  This migration optimizes RLS policies by using `(select auth.uid())` instead of `auth.uid()`.
  This prevents the auth function from being re-evaluated for each row, significantly improving
  query performance at scale.

  ### Tables Affected
  1. `credits_ledger` - INSERT and SELECT policies
  2. `customers` - SELECT policy
  3. `reading_cards` - SELECT policy
  4. `readings` - SELECT policy
  5. `subscriptions` - SELECT policy
  6. `user_preferences` - SELECT policy

  ## Performance Notes
  - The `(select auth.uid())` pattern evaluates once per query instead of once per row
  - This can improve performance by 10-100x on large result sets
  - See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- Credits Ledger: Optimize INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert credits" ON credits_ledger;

CREATE POLICY "Authenticated users can insert credits"
  ON credits_ledger FOR INSERT
  TO authenticated
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    ))
    OR
    ((select auth.uid()) = user_id)
  );

-- Credits Ledger: Optimize SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read credits" ON credits_ledger;

CREATE POLICY "Authenticated users can read credits"
  ON credits_ledger FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    ))
    OR
    ((select auth.uid()) = user_id)
  );

-- Customers: Optimize SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read customers" ON customers;

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    ))
    OR
    ((select auth.uid()) = user_id)
  );

-- Reading Cards: Optimize SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read reading cards" ON reading_cards;

CREATE POLICY "Authenticated users can read reading cards"
  ON reading_cards FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    ))
    OR
    (EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = (select auth.uid())
    ))
  );

-- Readings: Optimize SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read readings" ON readings;

CREATE POLICY "Authenticated users can read readings"
  ON readings FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    ))
    OR
    ((select auth.uid()) = user_id)
  );

-- Subscriptions: Optimize SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read subscriptions" ON subscriptions;

CREATE POLICY "Authenticated users can read subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    ))
    OR
    (EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = subscriptions.customer_id
      AND customers.user_id = (select auth.uid())
    ))
  );

-- User Preferences: Optimize SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read user preferences" ON user_preferences;

CREATE POLICY "Authenticated users can read user preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    ))
    OR
    ((select auth.uid()) = user_id)
  );
