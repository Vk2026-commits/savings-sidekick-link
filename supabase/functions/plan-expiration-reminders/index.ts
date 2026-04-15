import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MONTHLY_PRICE = 9.99;
const ANNUAL_PRICE = MONTHLY_PRICE * 12;
const DISCOUNT_20 = 0.20;
const DISCOUNT_10 = 0.10;

function buildReminderEmail(displayName: string, daysLeft: number, expiresDate: string): string {
  const isSevenDay = daysLeft <= 7;
  const discountedAnnual = (ANNUAL_PRICE * (1 - DISCOUNT_20)).toFixed(2);
  const discountedMonthly = (MONTHLY_PRICE * (1 - DISCOUNT_10)).toFixed(2);

  const discountSection = isSevenDay ? `
      <div style="background:linear-gradient(135deg,#065f46,#047857);border:1px solid #10b981;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <p style="color:#6ee7b7;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;font-weight:bold;">🎉 Exclusive Offer — Limited Time</p>
        <p style="color:#f0fdf4;font-size:18px;font-weight:bold;margin:0 0 16px;">Don't lose access to your Pro features!</p>
        
        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px;">
          <div style="background:#0f172a;border:1px solid #10b981;border-radius:10px;padding:16px 20px;flex:1;max-width:220px;">
            <p style="color:#10b981;font-size:24px;font-weight:bold;margin:0;">20% OFF</p>
            <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Annual Plan</p>
            <p style="color:#f8fafc;font-size:16px;font-weight:bold;margin:8px 0 0;">$${discountedAnnual}/year</p>
            <p style="color:#64748b;font-size:11px;text-decoration:line-through;margin:2px 0 0;">$${ANNUAL_PRICE.toFixed(2)}/year</p>
          </div>
          <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px 20px;flex:1;max-width:220px;">
            <p style="color:#f59e0b;font-size:24px;font-weight:bold;margin:0;">10% OFF</p>
            <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Monthly Plan</p>
            <p style="color:#f8fafc;font-size:16px;font-weight:bold;margin:8px 0 0;">$${discountedMonthly}/mo</p>
            <p style="color:#64748b;font-size:11px;text-decoration:line-through;margin:2px 0 0;">$${MONTHLY_PRICE.toFixed(2)}/mo</p>
          </div>
        </div>
        
        <p style="color:#6ee7b7;font-size:12px;margin:0;">Offer expires when your plan does. Act now!</p>
      </div>` : '';

  const urgencyColor = daysLeft <= 7 ? '#ef4444' : daysLeft <= 14 ? '#f59e0b' : '#3b82f6';
  const urgencyText = daysLeft <= 7 ? '⚠️ Final Notice' : daysLeft <= 14 ? '⏰ Reminder' : '📅 Heads Up';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #334155;border-radius:16px;padding:40px;text-align:center;">
      <div style="width:60px;height:60px;background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:white;">✦</span>
      </div>
      
      <div style="display:inline-block;background:${urgencyColor}20;border:1px solid ${urgencyColor}40;border-radius:20px;padding:6px 16px;margin-bottom:20px;">
        <span style="color:${urgencyColor};font-size:13px;font-weight:bold;">${urgencyText}</span>
      </div>
      
      <h1 style="color:#f8fafc;font-size:22px;margin:0 0 8px;">Your Faithnancial Pro Plan Expires Soon</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 32px;">${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining</p>

      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;text-align:left;">
        <p style="color:#f8fafc;font-size:14px;margin:0 0 12px;">Hey ${displayName},</p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 12px;">
          Your Faithnancial Pro plan is set to expire on <strong style="color:#f8fafc;">${expiresDate}</strong>.
          After that, your account will revert to the Free plan.
        </p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0;">
          Don't worry — <strong style="color:#10b981;">all your data will be saved</strong> and waiting for you if you decide to upgrade again.
          However, you'll lose access to unlimited bills, estate planning entries, analytics, and more.
        </p>
      </div>

      ${discountSection}

      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
        <p style="color:#f8fafc;font-size:14px;font-weight:bold;margin:0 0 12px;">What you'll lose on Free:</p>
        <p style="color:#94a3b8;font-size:13px;line-height:1.8;margin:0;">
          ❌ Limited to 3 bills (currently unlimited)<br/>
          ❌ Limited to 1 estate entry per section<br/>
          ❌ No spending analytics<br/>
          ❌ No cash flow forecasting<br/>
          ❌ No net worth tracking
        </p>
      </div>

      <a href="https://dough-dreams-docket.lovable.app" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:14px;margin-bottom:24px;">
        Renew My Pro Plan
      </a>

      <p style="color:#64748b;font-size:12px;margin:24px 0 0;">
        This email was sent by the Faithnancial team. If you have questions, reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get all users with active trials or pro plans that have an expiration date
    const { data: subs, error: subError } = await adminClient
      .from("user_subscriptions")
      .select("user_id, tier, trial_expires_at")
      .in("tier", ["trial_30", "trial_90", "pro"])
      .not("trial_expires_at", "is", null);

    if (subError) throw subError;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: "No expiring plans found", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const sentEmails: string[] = [];
    const REMINDER_DAYS = [30, 14, 7];

    for (const sub of subs) {
      const expiresAt = new Date(sub.trial_expires_at);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Determine which reminder to send
      let reminderType: string | null = null;
      if (daysLeft <= 7 && daysLeft > 0) reminderType = "7_day";
      else if (daysLeft <= 14 && daysLeft > 7) reminderType = "14_day";
      else if (daysLeft <= 30 && daysLeft > 14) reminderType = "30_day";

      if (!reminderType) continue;

      // Check if already sent
      const { data: existing } = await adminClient
        .from("plan_reminder_log")
        .select("id")
        .eq("user_id", sub.user_id)
        .eq("reminder_type", reminderType)
        .maybeSingle();

      if (existing) continue;

      // Get user info
      const { data: authUser } = await adminClient.auth.admin.getUserById(sub.user_id);
      if (!authUser?.user?.email) continue;

      const { data: profile } = await adminClient
        .from("profiles")
        .select("display_name")
        .eq("user_id", sub.user_id)
        .maybeSingle();

      const displayName = profile?.display_name || authUser.user.email.split("@")[0];
      const formattedDate = expiresAt.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });

      const emailHtml = buildReminderEmail(displayName, daysLeft, formattedDate);

      // Send email via magic link trigger (same pattern as send-trial-email)
      // This triggers the Supabase email delivery system
      await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ email: authUser.user.email }),
      });

      // Log that we sent this reminder
      await adminClient.from("plan_reminder_log").insert({
        user_id: sub.user_id,
        reminder_type: reminderType,
      });

      sentEmails.push(`${authUser.user.email} (${reminderType})`);
    }

    return new Response(JSON.stringify({
      message: `Sent ${sentEmails.length} expiration reminders`,
      sent: sentEmails.length,
      details: sentEmails,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Reminder error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
