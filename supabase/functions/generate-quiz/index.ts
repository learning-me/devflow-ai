import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, action, answer, questionText, difficulty } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    let prompt: string;
    let systemPrompt: string;

    if (action === 'generate') {
      systemPrompt = `You are an expert technical interviewer. Generate exactly 3 questions about the given programming topic. Return ONLY valid JSON.`;
      prompt = `Generate 3 questions about "${topic}" for a developer learning assessment.

Requirements:
- Question 1: Easy (basic concept understanding)
- Question 2: Medium (practical application)
- Question 3: Hard (edge cases, advanced usage)

Return ONLY this JSON format, no other text:
{
  "questions": [
    {"id": "1", "text": "question text here", "difficulty": "easy"},
    {"id": "2", "text": "question text here", "difficulty": "medium"},
    {"id": "3", "text": "question text here", "difficulty": "hard"}
  ]
}`;
    } else if (action === 'evaluate') {
      systemPrompt = `You are an expert technical evaluator. Evaluate the answer and provide feedback. Return ONLY valid JSON.`;
      prompt = `Evaluate this answer for a ${difficulty} level question about programming.

Question: ${questionText}
User's Answer: ${answer}

Evaluate if the answer demonstrates understanding. Be fair but rigorous.
For easy questions: accept basic understanding.
For medium questions: expect practical knowledge.
For hard questions: expect deep understanding.

Return ONLY this JSON format, no other text:
{
  "isCorrect": true or false,
  "feedback": "brief explanation of why correct/incorrect and what was good or missing"
}`;
    } else {
      throw new Error('Invalid action');
    }

    console.log(`Processing ${action} request for topic: ${topic || questionText}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response received:', content.substring(0, 200));

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const result = JSON.parse(jsonContent);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
