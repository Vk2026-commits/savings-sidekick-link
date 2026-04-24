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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "list_users": {
        const { data, error } = await adminClient.auth.admin.listUsers({ page: params.page || 1, perPage: params.perPage || 50 });
        if (error) throw error;
        const userIds = (data.users || []).map((u: any) => u.id);
        const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
          adminClient.from("profiles").select("user_id, display_name, email").in("user_id", userIds),
          adminClient.from("user_subscriptions").select("user_id, tier, trial_expires_at").in("user_id", userIds),
        ]);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        const subMap = new Map((subscriptions || []).map((s: any) => [s.user_id, { tier: s.tier, trial_expires_at: s.trial_expires_at }]));
        const users = (data.users || []).map((u: any) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          banned: u.banned_until ? true : false,
          banned_until: u.banned_until,
          display_name: profileMap.get(u.id)?.display_name || null,
          tier: subMap.get(u.id)?.tier || "free",
          trial_expires_at: subMap.get(u.id)?.trial_expires_at || null,
        }));
        return new Response(JSON.stringify({ users }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "reset_password": {
        if (!params.userId || !params.newPassword) {
          return new Response(JSON.stringify({ error: "userId and newPassword required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const { error } = await adminClient.auth.admin.updateUserById(params.userId, { password: params.newPassword });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "toggle_ban": {
        if (!params.userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const { error } = await adminClient.auth.admin.updateUserById(params.userId, {
          ban_duration: params.ban ? "876000h" : "none",
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, banned: params.ban }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "upgrade_plan": {
        if (!params.userId || !params.tier) {
          return new Response(JSON.stringify({ error: "userId and tier required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const validTiers = ["free", "pro"];
        if (!validTiers.includes(params.tier)) {
          return new Response(JSON.stringify({ error: "Invalid tier" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Upsert subscription
        const { data: existing } = await adminClient.from("user_subscriptions").select("id").eq("user_id", params.userId).maybeSingle();
        if (existing) {
          await adminClient.from("user_subscriptions").update({ tier: params.tier, updated_at: new Date().toISOString() }).eq("user_id", params.userId);
        } else {
          await adminClient.from("user_subscriptions").insert({ user_id: params.userId, tier: params.tier });
        }
        return new Response(JSON.stringify({ success: true, tier: params.tier }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "delete_user_data": {
        if (!params.userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const tables = ["bills", "transactions", "income_sources", "savings_goals", "category_budgets", "assets", "liabilities", "expense_groups", "payment_accounts"];
        for (const table of tables) {
          await adminClient.from(table).delete().eq("user_id", params.userId);
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "get_user_stats": {
        if (!params.userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const [bills, txns, income, goals] = await Promise.all([
          adminClient.from("bills").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
          adminClient.from("transactions").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
          adminClient.from("income_sources").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
          adminClient.from("savings_goals").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
        ]);
        return new Response(JSON.stringify({
          bills: bills.count || 0,
          transactions: txns.count || 0,
          income_sources: income.count || 0,
          savings_goals: goals.count || 0,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
