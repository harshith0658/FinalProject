import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonTitle, lessonDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a fun, friendly quiz creator for very young children under 6 years old. Create super simple, engaging geography quizzes that are playful and easy to understand.

IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "funFact": "A fun fact about the answer!"
    }
  ]
}`;

    const userPrompt = `Create 10 very simple, fun multiple choice questions about: "${lessonTitle}"
${lessonDescription ? `Description: ${lessonDescription}` : ''}

Requirements:
- VERY simple language for kids UNDER 6 years old (pre-kindergarten level)
- Use short sentences with easy words
- Questions must be DIRECTLY related to "${lessonTitle}" topic
- 4 options per question (make wrong answers obviously different)
- Include a short, fun fact for each correct answer
- All questions should be very easy
- Use emojis to make it colorful and fun 🌍 🎈 ⭐
- Focus on basic concepts like colors, shapes, simple counting, and recognition
- Make questions visual and concrete (avoid abstract concepts)

Examples of appropriate questions:
- "What color is the ocean? 💙"
- "How many continents can you see? 🌍"
- "Which one is bigger? 🐘"

Return ONLY the JSON object, no other text or formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON
    const quizData = JSON.parse(content);
    
    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate quiz" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
