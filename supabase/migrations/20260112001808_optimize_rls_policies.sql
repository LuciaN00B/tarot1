/*
  # Optimize RLS policies for better performance

  1. Changes
    - Replace auth.uid() with (select auth.uid()) in all RLS policies
    - This prevents re-evaluation of auth function for each row
  
  2. Affected Tables
    - user_preferences
    - readings
    - reading_cards
    - customers
    - subscriptions
    - credits_ledger
*/

-- user_preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- readings policies
DROP POLICY IF EXISTS "Users can view own readings" ON readings;
DROP POLICY IF EXISTS "Users can insert own readings" ON readings;
DROP POLICY IF EXISTS "Users can update own readings" ON readings;
DROP POLICY IF EXISTS "Users can delete own readings" ON readings;

CREATE POLICY "Users can view own readings"
  ON readings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own readings"
  ON readings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own readings"
  ON readings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own readings"
  ON readings FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- reading_cards policies
DROP POLICY IF EXISTS "Users can view own reading cards" ON reading_cards;
DROP POLICY IF EXISTS "Users can insert own reading cards" ON reading_cards;
DROP POLICY IF EXISTS "Users can delete own reading cards" ON reading_cards;

CREATE POLICY "Users can view own reading cards"
  ON reading_cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own reading cards"
  ON reading_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own reading cards"
  ON reading_cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = (select auth.uid())
    )
  );

-- customers policies
DROP POLICY IF EXISTS "Users can read own customer data" ON customers;
DROP POLICY IF EXISTS "Users can insert own customer data" ON customers;
DROP POLICY IF EXISTS "Users can update own customer data" ON customers;

CREATE POLICY "Users can read own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own customer data"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own customer data"
  ON customers FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- subscriptions policies
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = subscriptions.customer_id
      AND customers.user_id = (select auth.uid())
    )
  );

-- credits_ledger policies
DROP POLICY IF EXISTS "Users can read own credits" ON credits_ledger;
DROP POLICY IF EXISTS "Users can insert own credits" ON credits_ledger;

CREATE POLICY "Users can read own credits"
  ON credits_ledger FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own credits"
  ON credits_ledger FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));