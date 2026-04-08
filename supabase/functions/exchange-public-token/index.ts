import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.97.0/cors";

const PLAID_ENV = "sandbox";
const PLAID_BASE_URL = `https://${PLAID_ENV}.plaid.com`;

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

    const { public_token, institution } = await req.json();
    if (!public_token) throw new Error("Missing public_token");

    // Exchange public token for access token
    const exchangeRes = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        public_token,
      }),
    });

    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok) {
      throw new Error(`Plaid exchange error: ${JSON.stringify(exchangeData)}`);
    }

    // Get account details
    const accountsRes = await fetch(`${PLAID_BASE_URL}/accounts/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        access_token: exchangeData.access_token,
      }),
    });

    const accountsData = await accountsRes.json();
    const accountIds = accountsData.accounts?.map((a: { account_id: string }) => a.account_id) || [];

    // Store in database
    const { error: insertError } = await supabase
      .from("linked_accounts")
      .insert({
        user_id: user.id,
        institution_name: institution?.name || "Unknown",
        institution_id: institution?.institution_id || null,
        access_token: exchangeData.access_token,
        item_id: exchangeData.item_id,
        account_ids: accountIds,
      });

    if (insertError) throw new Error(`DB error: ${insertError.message}`);

    return new Response(JSON.stringify({ success: true, accounts: accountsData.accounts }), {
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
