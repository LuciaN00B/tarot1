/*
  # Drop Unused Database Indexes

  ## Changes
  This migration removes unused indexes to improve write performance and reduce storage overhead.

  ### Indexes Being Dropped
  1. `idx_readings_created_at` on table `public.readings`
  2. `idx_knowledge_chunks_source` on table `public.knowledge_chunks`
  3. `idx_knowledge_chunks_embedding` on table `public.knowledge_chunks`
  4. `idx_customers_stripe` on table `public.customers`
  5. `idx_subscriptions_customer` on table `public.subscriptions`
  6. `idx_subscriptions_stripe` on table `public.subscriptions`
  7. `idx_credits_ledger_created` on table `public.credits_ledger`
  8. `idx_admin_users_user` on table `public.admin_users`
  9. `idx_reading_cards_card_id` on table `public.reading_cards`

  ## Notes
  - These indexes were identified as unused and can be safely removed
  - If needed in the future, they can be recreated
  - This will improve write performance on these tables
*/

DROP INDEX IF EXISTS idx_readings_created_at;
DROP INDEX IF EXISTS idx_knowledge_chunks_source;
DROP INDEX IF EXISTS idx_knowledge_chunks_embedding;
DROP INDEX IF EXISTS idx_customers_stripe;
DROP INDEX IF EXISTS idx_subscriptions_customer;
DROP INDEX IF EXISTS idx_subscriptions_stripe;
DROP INDEX IF EXISTS idx_credits_ledger_created;
DROP INDEX IF EXISTS idx_admin_users_user;
DROP INDEX IF EXISTS idx_reading_cards_card_id;
