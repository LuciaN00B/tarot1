/*
  # Create Payment Tables for Stripe Integration

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - reference to auth.users
      - `stripe_customer_id` (text) - Stripe customer ID
      - `email` (text) - customer email
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key) - reference to customers
      - `stripe_subscription_id` (text) - Stripe subscription ID
      - `status` (text) - subscription status
      - `plan_type` (text) - free, basic, premium
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `cancel_at_period_end` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `credits_ledger`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - reference to auth.users
      - `amount` (integer) - positive for credits, negative for usage
      - `transaction_type` (text) - purchase, subscription, usage, bonus, refund
      - `description` (text) - transaction description
      - `reference_id` (text) - optional reference to reading or payment
      - `balance_after` (integer) - balance after transaction
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only read their own payment data
*/

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id text UNIQUE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing', 'unpaid')),
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'premium')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Credits ledger table
CREATE TABLE IF NOT EXISTS credits_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'subscription', 'usage', 'bonus', 'refund', 'signup')),
  description text DEFAULT '',
  reference_id text,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_user ON credits_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_created ON credits_ledger(created_at DESC);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_ledger ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can read own customer data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customer data"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customer data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = subscriptions.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- Credits ledger policies
CREATE POLICY "Users can read own credits"
  ON credits_ledger
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON credits_ledger
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
