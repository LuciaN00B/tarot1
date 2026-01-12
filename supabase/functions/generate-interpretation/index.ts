import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DrawnCard {
  cardName: string;
  positionName: string;
  isReversed: boolean;
  meaning: string;
  keywords: string[];
}

interface InterpretationRequest {
  question: string;
  spreadType: string;
  drawnCards: DrawnCard[];
  tone: string;
  language: string;
  focusAreas: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: InterpretationRequest = await req.json();
    const { question, spreadType, drawnCards, tone, language, focusAreas } = body;

    const isItalian = language === "IT";
    
    const toneDescriptions: Record<string, { en: string; it: string }> = {
      soft: { en: "gentle, nurturing, and encouraging", it: "gentile, premuroso e incoraggiante" },
      pragmatic: { en: "practical, grounded, and action-oriented", it: "pratico, concreto e orientato all'azione" },
      spiritual: { en: "mystical, introspective, and spiritually deep", it: "mistico, introspettivo e spiritualmente profondo" },
      direct: { en: "straightforward, honest, and clear", it: "diretto, onesto e chiaro" },
    };

    const toneDesc = toneDescriptions[tone] || toneDescriptions.soft;
    const focusContext = focusAreas.length > 0 
      ? (isItalian ? `L'utente e particolarmente interessato a: ${focusAreas.join(", ")}.` : `The user is particularly interested in: ${focusAreas.join(", ")}.`)
      : "";

    const cardsDescription = drawnCards.map((card, i) => {
      const reversedText = card.isReversed 
        ? (isItalian ? " (rovesciata)" : " (reversed)") 
        : (isItalian ? " (dritta)" : " (upright)");
      return `${i + 1}. ${card.cardName}${reversedText} - ${isItalian ? "Posizione" : "Position"}: ${card.positionName}\n   ${isItalian ? "Parole chiave" : "Keywords"}: ${card.keywords.join(", ")}\n   ${isItalian ? "Significato" : "Meaning"}: ${card.meaning}`;
    }).join("\n\n");

    const systemPrompt = isItalian
      ? `Sei un saggio interprete di tarocchi che aiuta le persone nella riflessione personale e nella crescita interiore. 
Il tuo tono e ${toneDesc.it}.

REGOLE IMPORTANTI:
- NON predire il futuro
- NON dare consigli medici, legali o finanziari
- Usa sempre un linguaggio riflessivo ("potrebbe suggerire", "invita a considerare", "potrebbe rappresentare")
- Concentrati sull'introspezione e la crescita personale
- I tarocchi sono uno specchio per i pensieri, non uno strumento di divinazione
- Incoraggia l'utente a riflettere su come i simboli risuonano con la sua esperienza

${focusContext}`
      : `You are a wise tarot interpreter who helps people with personal reflection and inner growth.
Your tone is ${toneDesc.en}.

IMPORTANT RULES:
- Do NOT predict the future
- Do NOT give medical, legal, or financial advice
- Always use reflective language ("may suggest", "invites you to consider", "could represent")
- Focus on introspection and personal growth
- Tarot is a mirror for thoughts, not a divination tool
- Encourage the user to reflect on how the symbols resonate with their experience

${focusContext}`;

    const userPrompt = isItalian
      ? `L'utente ha posto questa domanda per la riflessione: "${question}"

Schema utilizzato: ${spreadType === "single" ? "Carta Singola" : spreadType === "three_card" ? "Tre Carte" : "Croce Celtica"}

Carte estratte:
${cardsDescription}

Fornisci:
1. Un messaggio introduttivo che connette la domanda ai temi generali delle carte (2-3 frasi)
2. Per ogni carta, un'interpretazione personalizzata che colleghi il suo significato alla domanda e alla posizione (3-4 frasi per carta)
3. Una SINTESI APPROFONDITA (5-7 frasi) che:
   - Integri tutti i simboli in una visione coerente e interconnessa
   - Identifichi i temi ricorrenti e le tensioni tra le carte
   - Offra spunti pratici per la riflessione
   - Suggerisca domande che l'utente puo porsi
   - Concluda con un messaggio di empowerment

Formatta la risposta come JSON con questa struttura:
{
  "overall": "messaggio introduttivo",
  "cards": {
    "nome_posizione": "interpretazione per quella posizione"
  },
  "synthesis": "sintesi approfondita con visione d'insieme"
}`
      : `The user asked this question for reflection: "${question}"

Spread used: ${spreadType === "single" ? "Single Card" : spreadType === "three_card" ? "Three Card Spread" : "Celtic Cross"}

Drawn cards:
${cardsDescription}

Provide:
1. An introductory message connecting the question to the general themes of the cards (2-3 sentences)
2. For each card, a personalized interpretation connecting its meaning to the question and position (3-4 sentences per card)
3. A COMPREHENSIVE SYNTHESIS (5-7 sentences) that:
   - Integrates all symbols into a coherent, interconnected vision
   - Identifies recurring themes and tensions between cards
   - Offers practical prompts for reflection
   - Suggests questions the user can ask themselves
   - Concludes with an empowering message

Format the response as JSON with this structure:
{
  "overall": "introductory message",
  "cards": {
    "position_name": "interpretation for that position"
  },
  "synthesis": "comprehensive synthesis with overall vision"
}`;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiKey) {
      const fallbackInterpretation = generateFallbackInterpretation(drawnCards, question, tone, isItalian);
      return new Response(JSON.stringify(fallbackInterpretation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!openaiResponse.ok) {
      const fallbackInterpretation = generateFallbackInterpretation(drawnCards, question, tone, isItalian);
      return new Response(JSON.stringify(fallbackInterpretation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    let interpretation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      interpretation = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackInterpretation(drawnCards, question, tone, isItalian);
    } catch {
      interpretation = generateFallbackInterpretation(drawnCards, question, tone, isItalian);
    }

    return new Response(JSON.stringify(interpretation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateFallbackInterpretation(
  drawnCards: DrawnCard[],
  question: string,
  tone: string,
  isItalian: boolean
) {
  const toneIntros: Record<string, { en: string; it: string }> = {
    soft: {
      en: "This reading gently invites you to explore",
      it: "Questa lettura ti invita dolcemente a esplorare",
    },
    pragmatic: {
      en: "Looking at this practically, the cards suggest",
      it: "Guardando praticamente, le carte suggeriscono",
    },
    spiritual: {
      en: "On a deeper spiritual level, this reading reveals",
      it: "A un livello spirituale piu profondo, questa lettura rivela",
    },
    direct: {
      en: "The cards clearly point to",
      it: "Le carte indicano chiaramente",
    },
  };

  const intro = toneIntros[tone] || toneIntros.soft;
  const overallMsg = isItalian
    ? `${intro.it} i temi legati alla tua domanda: "${question}". Le carte che hai estratto offrono simboli potenti per la riflessione personale.`
    : `${intro.en} themes related to your question: "${question}". The cards you've drawn offer powerful symbols for personal reflection.`;

  const cardInterps: Record<string, string> = {};
  drawnCards.forEach((card) => {
    const reversedNote = card.isReversed
      ? (isItalian ? " In posizione rovesciata, questo potrebbe indicare blocchi o sfide in quest'area." : " In the reversed position, this may indicate blocks or challenges in this area.")
      : "";
    
    cardInterps[card.positionName] = isItalian
      ? `${card.cardName} nella posizione "${card.positionName}" porta energie legate a: ${card.keywords.slice(0, 3).join(", ")}. ${card.meaning}${reversedNote} Rifletti su come questi temi si manifestano nella tua vita.`
      : `${card.cardName} in the "${card.positionName}" position brings energies of ${card.keywords.slice(0, 3).join(", ")}. ${card.meaning}${reversedNote} Reflect on how these themes manifest in your life.`;
  });

  const allKeywords = drawnCards.flatMap(c => c.keywords.slice(0, 2));
  const uniqueThemes = [...new Set(allKeywords)].slice(0, 4);
  const themesStr = uniqueThemes.join(", ");

  const synthesis = isItalian
    ? `Guardando questa lettura nel suo complesso, emergono temi interconnessi di ${themesStr}. Le carte, considerate insieme, suggeriscono un momento in cui questi aspetti della tua vita si intrecciano e si influenzano reciprocamente. Ogni carta aggiunge una sfumatura unica al quadro generale, creando un mosaico di significati che solo tu puoi interpretare pienamente. Chiediti: quali connessioni vedo tra queste energie? Come si relazionano alla mia domanda originale? Ricorda che questa lettura e uno specchio per i tuoi pensieri e sentimenti, non una previsione. Usa questi simboli come spunti per l'auto-riflessione e lascia che guidino la tua crescita personale nei prossimi giorni.`
    : `Looking at this reading as a whole, interconnected themes of ${themesStr} emerge. The cards, considered together, suggest a moment where these aspects of your life interweave and influence each other. Each card adds a unique nuance to the overall picture, creating a mosaic of meanings that only you can fully interpret. Ask yourself: what connections do I see between these energies? How do they relate to my original question? Remember that this reading is a mirror for your thoughts and feelings, not a prediction. Use these symbols as prompts for self-reflection and let them guide your personal growth in the coming days.`;

  return {
    overall: overallMsg,
    cards: cardInterps,
    synthesis,
    generatedAt: new Date().toISOString(),
    tone,
  };
}