/*
  # Add Vector Similarity Search Function

  1. New Functions
    - `match_knowledge_chunks` - RPC function to find similar knowledge chunks using vector similarity
      - Parameters:
        - query_embedding (vector) - the embedding to search for
        - match_threshold (float) - minimum similarity threshold
        - match_count (int) - maximum number of results
      - Returns: table with content, source_name, and similarity score

  2. Purpose
    - Enables RAG (Retrieval Augmented Generation) for enhanced AI interpretations
    - Uses cosine similarity for vector matching
*/

CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  source_name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    ks.name AS source_name,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  JOIN knowledge_sources ks ON ks.id = kc.source_id
  WHERE kc.embedding IS NOT NULL
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
