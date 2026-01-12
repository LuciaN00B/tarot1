/*
  # Fix function search_path security issues

  1. Changes
    - Recreate match_knowledge_chunks with immutable search_path
    - Recreate is_admin with immutable search_path
  
  2. Security
    - Setting search_path to '' prevents search_path injection attacks
*/

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.3,
  match_count integer DEFAULT 5
)
RETURNS TABLE(id uuid, content text, source_name text, similarity double precision)
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    ks.name AS source_name,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  JOIN public.knowledge_sources ks ON ks.id = kc.source_id
  WHERE kc.embedding IS NOT NULL
  AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$function$;