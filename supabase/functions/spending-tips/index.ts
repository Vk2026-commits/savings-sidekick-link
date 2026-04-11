import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { spendingByCategory, monthlyIncome } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a personal finance advisor. Analyze these monthly spending habits and compare them to US averages (from BLS Consumer Expenditure Survey).

Monthly Income: $${monthlyIncome}

User's Spending by Category:
${Object.entries(spendingByCategory).map(([cat, amt]) => `- ${cat}: $${amt}`).join("\n")}

US Average Spending (% of pre-tax income):
- Housing: 33%
- Transportation: 16%
- Food: 13%
- Insurance/Pensions: 12%
- Healthcare: 8%
- Entertainment: 5%
- Utilities: 4%
- Clothing: 3%
- Education: 2%
- Other: 4%

Provide a JSON response with this structure:
{
  "comparisons": [
    { "category": "string", "userAmount": number, "userPercent": number, "usAvgPercent": number, "status": "under|over|on-track", "difference": number }
  ],
  "tips": [
    { "title": "string", "description": "string", "potentialSavings": number }
  ],
  "overallScore": number (1-100, 100 being excellent),
  "summary": "string"
}

Give 3-5 actionable tips. Be specific with dollar amounts. Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ analysis: JSON.parse(content) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("spending-tips error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
