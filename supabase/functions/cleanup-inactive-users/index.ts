import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const INACTIVITY_DAYS = 90;
    const cutoffDate = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // 1. Get all free-tier users
    const { data: freeSubs, error: subError } = await adminClient
      .from("user_subscriptions")
      .select("user_id")
      .eq("tier", "free");

    if (subError) throw subError;
    if (!freeSubs || freeSubs.length === 0) {
      return new Response(JSON.stringify({ message: "No free users found", purged: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const freeUserIds = freeSubs.map((s: any) => s.user_id);

    // 2. Check last sign-in for each free user via auth admin API
    const inactiveUserIds: string[] = [];

    // Batch fetch users (paginated)
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (authError) throw authError;

    for (const authUser of authData.users) {
      if (!freeUserIds.includes(authUser.id)) continue;

      const lastActive = authUser.last_sign_in_at || authUser.created_at;
      if (lastActive && new Date(lastActive) < new Date(cutoffDate)) {
        inactiveUserIds.push(authUser.id);
      }
    }

    if (inactiveUserIds.length === 0) {
      return new Response(JSON.stringify({ message: "No inactive free users found", purged: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Purge data for inactive free users
    const tables = [
      "bills", "transactions", "income_sources", "savings_goals",
      "category_budgets", "assets", "liabilities", "expense_groups",
      "payment_accounts",
      // Estate tables
      "estate_people", "estate_beneficiaries", "estate_beneficiary_links",
      "estate_accounts", "estate_insurance", "estate_property",
      "estate_digital_access", "estate_legal_documents", "estate_documents",
      "estate_wishes", "estate_trusted_contacts", "estate_access_requests",
      "estate_tab_status", "estate_audit_log",
    ];

    const purgedUsers: string[] = [];

    for (const userId of inactiveUserIds) {
      let success = true;
      for (const table of tables) {
        const { error } = await adminClient.from(table).delete().eq("user_id", userId);
        if (error) {
          console.error(`Error deleting from ${table} for ${userId}:`, error.message);
          success = false;
        }
      }
      if (success) {
        purgedUsers.push(userId);
      }
    }

    return new Response(JSON.stringify({
      message: `Purged data for ${purgedUsers.length} inactive free users`,
      purged: purgedUsers.length,
      userIds: purgedUsers,
      cutoffDate,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
