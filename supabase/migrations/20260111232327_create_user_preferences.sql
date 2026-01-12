/*
  # Create User Preferences Table

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `language` (text, IT or EN)
      - `reading_tone` (text, soft/pragmatic/spiritual/direct)
      - `focus_areas` (text array)
      - `experience_level` (text, beginner/intermediate)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for authenticated users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  language text NOT NULL DEFAULT 'EN' CHECK (language IN ('IT', 'EN')),
  reading_tone text NOT NULL DEFAULT 'soft' CHECK (reading_tone IN ('soft', 'pragmatic', 'spiritual', 'direct')),
  focus_areas text[] DEFAULT ARRAY[]::text[],
  experience_level text NOT NULL DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);