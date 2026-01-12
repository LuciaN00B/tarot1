/*
  # Create Admin Users Table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - reference to auth.users
      - `role` (text) - admin role level
      - `permissions` (jsonb) - specific permissions
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Only admins can read admin_users table
    - Service role used for admin management

  3. Helper Functions
    - is_admin() function for checking admin status
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin users policies
CREATE POLICY "Admins can read admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin policies to other tables for admin access

-- Admins can read all user preferences
CREATE POLICY "Admins can read all user preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can read all readings
CREATE POLICY "Admins can read all readings"
  ON readings
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can read all reading cards
CREATE POLICY "Admins can read all reading cards"
  ON reading_cards
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can manage knowledge sources
CREATE POLICY "Admins can insert knowledge sources"
  ON knowledge_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update knowledge sources"
  ON knowledge_sources
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete knowledge sources"
  ON knowledge_sources
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Admins can manage knowledge chunks
CREATE POLICY "Admins can insert knowledge chunks"
  ON knowledge_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update knowledge chunks"
  ON knowledge_chunks
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete knowledge chunks"
  ON knowledge_chunks
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Admins can read all customers
CREATE POLICY "Admins can read all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can manage subscriptions
CREATE POLICY "Admins can update subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can read all credits
CREATE POLICY "Admins can read all credits"
  ON credits_ledger
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can insert credits (for bonuses, refunds)
CREATE POLICY "Admins can insert credits"
  ON credits_ledger
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());
