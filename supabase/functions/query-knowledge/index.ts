import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QueryRequest {
  query: string;
  cardNames?: string[];
  limit?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: QueryRequest = await req.json();
    const { query, cardNames = [], limit = 5 } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQuery = cardNames.length > 0 
      ? `${query} ${cardNames.join(" ")}`
      : query;

    let queryEmbedding: number[] | null = null;
    try {
      const model = new Supabase.ai.Session("gte-small");
      const result = await model.run(searchQuery, { mean_pool: true, normalize: true });
      queryEmbedding = Array.from(result);
    } catch {
      console.log("Embedding generation failed, falling back to text search");
    }

    let chunks: { content: string; source_name: string; similarity?: number }[] = [];

    if (queryEmbedding) {
      const { data, error } = await supabase.rpc("match_knowledge_chunks", {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit,
      });

      if (!error && data) {
        chunks = data.map((chunk: { content: string; source_name: string; similarity: number }) => ({
          content: chunk.content,
          source_name: chunk.source_name,
          similarity: chunk.similarity,
        }));
      }
    }

    if (chunks.length === 0) {
      const searchTerms = searchQuery.toLowerCase().split(" ").filter(t => t.length > 3);
      
      const { data: textResults } = await supabase
        .from("knowledge_chunks")
        .select(`
          content,
          knowledge_sources!inner(name)
        `)
        .limit(limit);

      if (textResults) {
        chunks = textResults
          .filter((r: { content: string }) => 
            searchTerms.some(term => r.content.toLowerCase().includes(term))
          )
          .map((r: { content: string; knowledge_sources: { name: string } }) => ({
            content: r.content,
            source_name: r.knowledge_sources.name,
          }));
      }
    }

    return new Response(
      JSON.stringify({
        chunks,
        query: searchQuery,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});