import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- Input schemas ----
const ListUsersSchema = z.object({ action: z.literal("list_users"), page: z.number().int().min(1).max(1000).optional(), perPage: z.number().int().min(1).max(200).optional() });
const ResetPasswordSchema = z.object({ action: z.literal("reset_password"), userId: z.string().uuid(), newPassword: z.string().min(8).max(128) });
const ToggleBanSchema = z.object({ action: z.literal("toggle_ban"), userId: z.string().uuid(), ban: z.boolean() });
const UpgradePlanSchema = z.object({ action: z.literal("upgrade_plan"), userId: z.string().uuid(), tier: z.enum(["free", "pro"]) });
const DeleteUserDataSchema = z.object({ action: z.literal("delete_user_data"), userId: z.string().uuid() });
const GetUserStatsSchema = z.object({ action: z.literal("get_user_stats"), userId: z.string().uuid() });
const ActionSchema = z.discriminatedUnion("action", [
  ListUsersSchema, ResetPasswordSchema, ToggleBanSchema, UpgradePlanSchema, DeleteUserDataSchema, GetUserStatsSchema,
]);

// Generic safe-error responder. Logs detail server-side, sends opaque message to client.
function fail(status: number, publicMessage: string, internalDetail?: unknown) {
  if (internalDetail) console.error(`[admin-users] ${publicMessage}:`, internalDetail);
  return new Response(JSON.stringify({ error: publicMessage }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function ok(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let adminClient: ReturnType<typeof createClient> | null = null;
  let adminId: string | null = null;
  let adminEmail: string | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail(401, "Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return fail(401, "Unauthorized");

    adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) return fail(403, "Forbidden");

    adminId = user.id;
    adminEmail = user.email ?? null;

    let body: unknown;
    try { body = await req.json(); } catch { return fail(400, "Invalid request body"); }

    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) return fail(400, "Invalid request parameters", parsed.error.flatten());
    const params = parsed.data;

    // Helper: write audit log entry (best-effort; never blocks the response on failure)
    const audit = async (action: string, targetUserId: string | null, details: Record<string, unknown> = {}) => {
      try {
        await adminClient!.from("admin_audit_log").insert({
          admin_id: adminId,
          admin_email: adminEmail,
          action,
          target_user_id: targetUserId,
          details,
          ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
          user_agent: req.headers.get("user-agent") || null,
        });
      } catch (e) {
        console.error("[admin-users] audit log write failed:", e);
      }
    };

    switch (params.action) {
      case "list_users": {
        const { data, error } = await adminClient.auth.admin.listUsers({ page: params.page || 1, perPage: params.perPage || 50 });
        if (error) return fail(500, "Failed to list users", error);
        const userIds = (data.users || []).map((u: any) => u.id);
        const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
          adminClient.from("profiles").select("user_id, display_name, email").in("user_id", userIds),
          adminClient.from("user_subscriptions").select("user_id, tier, trial_expires_at").in("user_id", userIds),
        ]);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        const subMap = new Map((subscriptions || []).map((s: any) => [s.user_id, { tier: s.tier, trial_expires_at: s.trial_expires_at }]));
        // ACCOUNT-LEVEL DATA ONLY: never include financial, estate, or document contents.
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
        await audit("list_users", null, { count: users.length });
        return ok({ users });
      }

      case "reset_password": {
        const { error } = await adminClient.auth.admin.updateUserById(params.userId, { password: params.newPassword });
        if (error) return fail(500, "Failed to reset password", error);
        await audit("reset_password", params.userId);
        return ok({ success: true });
      }

      case "toggle_ban": {
        const { error } = await adminClient.auth.admin.updateUserById(params.userId, {
          ban_duration: params.ban ? "876000h" : "none",
        });
        if (error) return fail(500, "Failed to update ban status", error);
        await audit("toggle_ban", params.userId, { banned: params.ban });
        return ok({ success: true, banned: params.ban });
      }

      case "upgrade_plan": {
        const { data: existing } = await adminClient.from("user_subscriptions").select("id").eq("user_id", params.userId).maybeSingle();
        if (existing) {
          await adminClient.from("user_subscriptions").update({ tier: params.tier, updated_at: new Date().toISOString() }).eq("user_id", params.userId);
        } else {
          await adminClient.from("user_subscriptions").insert({ user_id: params.userId, tier: params.tier });
        }
        await audit("upgrade_plan", params.userId, { tier: params.tier });
        return ok({ success: true, tier: params.tier });
      }

      case "delete_user_data": {
        const tables = ["bills", "transactions", "income_sources", "savings_goals", "category_budgets", "assets", "liabilities", "expense_groups", "payment_accounts"];
        for (const table of tables) {
          await adminClient.from(table).delete().eq("user_id", params.userId);
        }
        await audit("delete_user_data", params.userId, { tables });
        return ok({ success: true });
      }

      case "get_user_stats": {
        // ACCOUNT-LEVEL COUNTS ONLY: never returns row contents.
        const [bills, txns, income, goals] = await Promise.all([
          adminClient.from("bills").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
          adminClient.from("transactions").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
          adminClient.from("income_sources").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
          adminClient.from("savings_goals").select("id", { count: "exact", head: true }).eq("user_id", params.userId),
        ]);
        await audit("get_user_stats", params.userId);
        return ok({
          bills: bills.count || 0,
          transactions: txns.count || 0,
          income_sources: income.count || 0,
          savings_goals: goals.count || 0,
        });
      }
    }
  } catch (err) {
    return fail(500, "Internal server error", err);
  }
});
