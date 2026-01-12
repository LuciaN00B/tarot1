/*
  # Add Indexes for Foreign Keys

  ## Changes
  This migration adds indexes for foreign key columns that were missing covering indexes.
  These indexes will improve query performance, especially for JOIN operations and foreign key constraint checks.

  ### Indexes Being Created
  1. `idx_knowledge_chunks_source_id` on `public.knowledge_chunks(source_id)`
  2. `idx_reading_cards_card_id` on `public.reading_cards(card_id)`
  3. `idx_subscriptions_customer_id` on `public.subscriptions(customer_id)`

  ## Performance Impact
  - Improves JOIN performance when querying related tables
  - Speeds up foreign key constraint validation
  - Enhances query optimizer's ability to choose efficient execution plans
*/

-- Add index for knowledge_chunks.source_id foreign key
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_id 
  ON knowledge_chunks(source_id);

-- Add index for reading_cards.card_id foreign key
CREATE INDEX IF NOT EXISTS idx_reading_cards_card_id 
  ON reading_cards(card_id);

-- Add index for subscriptions.customer_id foreign key
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id 
  ON subscriptions(customer_id);
