/*
  # Add missing index on reading_cards.card_id

  1. Changes
    - Add index on reading_cards.card_id to improve foreign key lookup performance
*/

CREATE INDEX IF NOT EXISTS idx_reading_cards_card_id ON reading_cards(card_id);