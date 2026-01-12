import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface IngestRequest {
  name: string;
  description: string;
  content: string;
  sourceType: string;
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: adminCheck } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: IngestRequest = await req.json();
    const { name, description, content, sourceType } = body;

    if (!name || !content) {
      return new Response(
        JSON.stringify({ error: "Name and content are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: source, error: sourceError } = await supabaseAdmin
      .from("knowledge_sources")
      .insert({
        name,
        description: description || "",
        source_type: sourceType || "manual",
      })
      .select()
      .single();

    if (sourceError || !source) {
      return new Response(
        JSON.stringify({ error: "Failed to create source" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chunks = splitIntoChunks(content, 500, 50);

    const model = new Supabase.ai.Session("gte-small");

    const chunkInserts = await Promise.all(
      chunks.map(async (chunkContent, index) => {
        let embedding = null;
        try {
          const result = await model.run(chunkContent, { mean_pool: true, normalize: true });
          embedding = Array.from(result);
        } catch {
          console.log("Embedding failed for chunk", index);
        }

        return {
          source_id: source.id,
          content: chunkContent,
          embedding,
          chunk_index: index,
          metadata: { char_count: chunkContent.length },
        };
      })
    );

    const { error: chunksError } = await supabaseAdmin
      .from("knowledge_chunks")
      .insert(chunkInserts);

    if (chunksError) {
      await supabaseAdmin.from("knowledge_sources").delete().eq("id", source.id);
      return new Response(
        JSON.stringify({ error: "Failed to create chunks" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        sourceId: source.id,
        chunksCreated: chunks.length,
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

function splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + " " + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(" ") + " " + sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}