/*
  # Create Knowledge Tables for RAG System

  1. New Tables
    - `knowledge_sources`
      - `id` (uuid, primary key)
      - `name` (text) - source document name
      - `source_type` (text) - manual, article, etc.
      - `description` (text) - description of the source
      - `metadata` (jsonb) - additional metadata
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `knowledge_chunks`
      - `id` (uuid, primary key)
      - `source_id` (uuid, foreign key) - reference to knowledge_sources
      - `content` (text) - the text content of the chunk
      - `embedding` (vector) - vector embedding for similarity search
      - `chunk_index` (integer) - order within source
      - `metadata` (jsonb) - additional metadata like page number, section
      - `created_at` (timestamptz)

  2. Extensions
    - Enable pgvector extension for vector similarity search

  3. Security
    - Enable RLS on both tables
    - Knowledge is read-only for authenticated users (admin writes via service role)
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge sources table
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'article', 'guide', 'interpretation')),
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Knowledge chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES knowledge_sources(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  embedding vector(384),
  chunk_index integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source ON knowledge_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Knowledge sources policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can read knowledge sources"
  ON knowledge_sources
  FOR SELECT
  TO authenticated
  USING (true);

-- Knowledge chunks policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can read knowledge chunks"
  ON knowledge_chunks
  FOR SELECT
  TO authenticated
  USING (true);
