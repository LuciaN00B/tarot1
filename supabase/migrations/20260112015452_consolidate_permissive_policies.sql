/*
  # Consolidate Multiple Permissive RLS Policies

  ## Changes
  This migration consolidates multiple permissive policies into single policies using OR logic.
  This improves security clarity and reduces policy evaluation overhead.

  ### Tables Affected
  1. `credits_ledger` - Consolidate INSERT and SELECT policies
  2. `customers` - Consolidate SELECT policies
  3. `reading_cards` - Consolidate SELECT policies
  4. `readings` - Consolidate SELECT policies
  5. `subscriptions` - Consolidate SELECT policies
  6. `user_preferences` - Consolidate SELECT policies

  ## Security Notes
  - Each consolidated policy maintains the same access logic
  - Admins retain full access to all data
  - Users retain access to their own data only
*/

-- Credits Ledger: Consolidate INSERT policies
DROP POLICY IF EXISTS "Admins can insert credits" ON credits_ledger;
DROP POLICY IF EXISTS "Users can insert own credits" ON credits_ledger;

CREATE POLICY "Authenticated users can insert credits"
  ON credits_ledger FOR INSERT
  TO authenticated
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
    OR
    (auth.uid() = user_id)
  );

-- Credits Ledger: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all credits" ON credits_ledger;
DROP POLICY IF EXISTS "Users can read own credits" ON credits_ledger;

CREATE POLICY "Authenticated users can read credits"
  ON credits_ledger FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
    OR
    (auth.uid() = user_id)
  );

-- Customers: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all customers" ON customers;
DROP POLICY IF EXISTS "Users can read own customer data" ON customers;

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
    OR
    (auth.uid() = user_id)
  );

-- Reading Cards: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all reading cards" ON reading_cards;
DROP POLICY IF EXISTS "Users can view own reading cards" ON reading_cards;

CREATE POLICY "Authenticated users can read reading cards"
  ON reading_cards FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
    OR
    (EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = auth.uid()
    ))
  );

-- Readings: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all readings" ON readings;
DROP POLICY IF EXISTS "Users can view own readings" ON readings;

CREATE POLICY "Authenticated users can read readings"
  ON readings FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
    OR
    (auth.uid() = user_id)
  );

-- Subscriptions: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;

CREATE POLICY "Authenticated users can read subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
    OR
    (EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = subscriptions.customer_id
      AND customers.user_id = auth.uid()
    ))
  );

-- User Preferences: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can read all user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;

CREATE POLICY "Authenticated users can read user preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    ))
    OR
    (auth.uid() = user_id)
  );
