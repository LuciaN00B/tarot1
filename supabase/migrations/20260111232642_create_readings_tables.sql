/*
  # Create Readings Tables

  1. New Tables
    - `readings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `question` (text)
      - `spread_type` (text - single/three_card/celtic_cross)
      - `interpretation` (jsonb - stores full interpretation data)
      - `notes` (text - user journaling)
      - `mood` (integer 1-5)
      - `seed` (text - reproducible random seed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `reading_cards`
      - `id` (uuid, primary key)
      - `reading_id` (uuid, references readings)
      - `card_id` (integer, references tarot_cards)
      - `position` (integer - card position in spread)
      - `position_name` (text - e.g., "Past", "Present", "Future")
      - `is_reversed` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own readings
*/

CREATE TABLE IF NOT EXISTS readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  spread_type text NOT NULL CHECK (spread_type IN ('single', 'three_card', 'celtic_cross')),
  interpretation jsonb DEFAULT '{}'::jsonb,
  notes text DEFAULT '',
  mood integer CHECK (mood >= 1 AND mood <= 5),
  seed text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reading_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id uuid REFERENCES readings(id) ON DELETE CASCADE NOT NULL,
  card_id integer REFERENCES tarot_cards(id) NOT NULL,
  position integer NOT NULL,
  position_name text NOT NULL,
  is_reversed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_cards_reading_id ON reading_cards(reading_id);

ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own readings"
  ON readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings"
  ON readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings"
  ON readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own readings"
  ON readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reading cards"
  ON reading_cards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reading cards"
  ON reading_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reading cards"
  ON reading_cards
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM readings
      WHERE readings.id = reading_cards.reading_id
      AND readings.user_id = auth.uid()
    )
  );