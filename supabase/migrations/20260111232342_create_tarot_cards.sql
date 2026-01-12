/*
  # Create Tarot Cards Table

  1. New Tables
    - `tarot_cards`
      - `id` (integer, primary key)
      - `name_en` (text)
      - `name_it` (text)
      - `arcana` (text, major/minor)
      - `suit` (text, nullable for major arcana)
      - `number` (integer, nullable)
      - `court` (text, nullable - page/knight/queen/king)
      - `keywords_en` (text array)
      - `keywords_it` (text array)
      - `upright_meaning_en` (text)
      - `upright_meaning_it` (text)
      - `reversed_meaning_en` (text)
      - `reversed_meaning_it` (text)
      - `image_url` (text, nullable)

  2. Security
    - Enable RLS with public read access (cards are public data)
*/

CREATE TABLE IF NOT EXISTS tarot_cards (
  id integer PRIMARY KEY,
  name_en text NOT NULL,
  name_it text NOT NULL,
  arcana text NOT NULL CHECK (arcana IN ('major', 'minor')),
  suit text CHECK (suit IN ('wands', 'cups', 'swords', 'pentacles') OR suit IS NULL),
  number integer,
  court text CHECK (court IN ('page', 'knight', 'queen', 'king') OR court IS NULL),
  keywords_en text[] DEFAULT ARRAY[]::text[],
  keywords_it text[] DEFAULT ARRAY[]::text[],
  upright_meaning_en text DEFAULT '',
  upright_meaning_it text DEFAULT '',
  reversed_meaning_en text DEFAULT '',
  reversed_meaning_it text DEFAULT '',
  image_url text
);

ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tarot cards"
  ON tarot_cards
  FOR SELECT
  TO authenticated
  USING (true);