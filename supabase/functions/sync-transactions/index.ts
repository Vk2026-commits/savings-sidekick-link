import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.97.0/cors";

const PLAID_ENV = "sandbox";
const PLAID_BASE_URL = `https://${PLAID_ENV}.plaid.com`;

// Map Plaid categories to app categories
function mapPlaidCategory(plaidCategories: string[]): string {
  const cat = (plaidCategories || []).map((c) => c.toLowerCase());
  const joined = cat.join(" ");

  if (joined.includes("rent") || joined.includes("mortgage") || joined.includes("housing")) return "housing";
  if (joined.includes("utilities") || joined.includes("electric") || joined.includes("water") || joined.includes("gas") || joined.includes("internet") || joined.includes("phone")) return "utilities";
  if (joined.includes("insurance")) return "insurance";
  if (joined.includes("subscription") || joined.includes("streaming")) return "subscriptions";
  if (joined.includes("transport") || joined.includes("gas station") || joined.includes("uber") || joined.includes("lyft") || joined.includes("taxi") || joined.includes("parking") || joined.includes("auto")) return "transportation";
  if (joined.includes("fast food") || joined.includes("coffee")) return "fast_food";
  if (joined.includes("restaurant") || joined.includes("dining")) return "restaurants";
  if (joined.includes("groceries") || joined.includes("supermarket") || joined.includes("food")) return "food";
  if (joined.includes("entertainment") || joined.includes("recreation") || joined.includes("arts")) return "entertainment";
  if (joined.includes("loan") || joined.includes("credit card") || joined.includes("debt")) return "debt";
  if (joined.includes("hair") || joined.includes("barber")) return "haircuts";
  if (joined.includes("beauty") || joined.includes("spa") || joined.includes("nail")) return "beauty";
  if (joined.includes("kids") || joined.includes("child") || joined.includes("baby") || joined.includes("toy")) return "kids";
  if (joined.includes("household") || joined.includes("home improvement") || joined.includes("furnit")) return "household";
  return "other";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const plaidClientId = Deno.env.get("PLAID_CLIENT_ID");
    const plaidSecret = Deno.env.get("PLAID_SECRET");

    if (!plaidClientId || !plaidSecret) {
      throw new Error("Plaid credentials not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: linkedAccounts, error: fetchError } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("user_id", user.id);

    if (fetchError) throw new Error(`DB error: ${fetchError.message}`);
    if (!linkedAccounts || linkedAccounts.length === 0) {
      return new Response(JSON.stringify({ message: "No linked accounts", transactions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    let allTransactions: Array<Record<string, unknown>> = [];
    let importedCount = 0;

    for (const account of linkedAccounts) {
      const txRes = await fetch(`${PLAID_BASE_URL}/transactions/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: plaidClientId,
          secret: plaidSecret,
          access_token: account.access_token,
          start_date: startDate,
          end_date: endDate,
          options: { count: 100, offset: 0 },
        }),
      });

      const txData = await txRes.json();
      if (!txRes.ok) continue;

      const transactions = txData.transactions || [];
      allTransactions = allTransactions.concat(transactions);

      for (const tx of transactions) {
        const mappedCategory = mapPlaidCategory(tx.category || []);
        const txType = tx.amount > 0 ? "expense" : "income";

        const { error } = await supabase
          .from("transactions")
          .upsert({
            user_id: user.id,
            date: tx.date,
            description: tx.name || tx.merchant_name || "Unknown",
            amount: Math.abs(tx.amount),
            type: txType,
            category: mappedCategory,
            notes: `Imported from ${account.institution_name} | Plaid ID: ${tx.transaction_id}`,
            source: "plaid",
            is_reconciled: false,
          }, { onConflict: "id" });

        if (!error) importedCount++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      imported: importedCount,
      total_fetched: allTransactions.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
