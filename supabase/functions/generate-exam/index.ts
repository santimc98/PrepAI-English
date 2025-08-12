// supabase/functions/generate-exam/index.ts
// Deno Deploy / Supabase Edge compatible
// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const { level = "B2", sections = ["Reading", "Use of English"] } = await req.json();

    const exam = {
      title: `Mock ${level} - ${new Date().toISOString().slice(0,10)}`,
      level,
      sections: sections.map((name: string, i: number) => ({
        id: `S${i+1}`,
        name,
        items: [
          { id: `Q${i+1}-1`, type: "multiple_choice", prompt: "Sample question", options: ["A","B","C","D"], answer: "B" },
        ],
      })),
    };

    return new Response(JSON.stringify(exam), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }
});
