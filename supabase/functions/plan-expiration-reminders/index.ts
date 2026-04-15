import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANNUAL_PRICE = 99;
const DISCOUNT_20 = 0.20;

function buildTrialEmail(displayName: string, daysLeft: number, variant: "day21" | "day26" | "day29"): { subject: string; html: string } {
  const subjects: Record<string, string> = {
    day21: "Your free trial is ending soon",
    day26: "Don't lose access to everything you've set up",
    day29: "Last day to keep your account active",
  };

  const bodies: Record<string, string> = {
    day21: `
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">Hey ${displayName},</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        You've been using the platform to organize your finances and important documents.
      </p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        Your trial ends in about a week. Once it ends, you'll lose access to:
      </p>
      <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0 0 16px;padding-left:20px;">
        <li>Budget tracking</li>
        <li>Net worth dashboard</li>
        <li>Stored documents and estate information</li>
      </ul>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Take a moment now to keep everything accessible.
      </p>`,
    day26: `
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">Hey ${displayName},</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        Your trial is almost over.
      </p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        Right now, everything you've built is still available:
      </p>
      <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0 0 16px;padding-left:20px;">
        <li>Financial overview</li>
        <li>Uploaded documents</li>
        <li>Estate planning details</li>
      </ul>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        When your trial ends, access will be restricted.
      </p>
      <p style="color:#f8fafc;font-size:14px;line-height:1.7;margin:0 0 24px;font-style:italic;">
        If something happened today, would everything be easy to find?
      </p>`,
    day29: `
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">Hey ${displayName},</p>
      <p style="color:#ef4444;font-size:15px;font-weight:bold;line-height:1.7;margin:0 0 16px;">
        Your trial ends tomorrow.
      </p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        If you don't upgrade:
      </p>
      <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0 0 16px;padding-left:20px;">
        <li>Your data will be locked</li>
        <li>Documents will not be accessible</li>
        <li>Your setup will be paused</li>
      </ul>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Don't lose what you've already organized.
      </p>`,
  };

  const ctaLabels: Record<string, string> = {
    day21: "Upgrade your account",
    day26: "Keep your account active",
    day29: "Upgrade now",
  };

  const urgencyColors: Record<string, string> = {
    day21: "#3b82f6",
    day26: "#f59e0b",
    day29: "#ef4444",
  };

  return {
    subject: subjects[variant],
    html: buildEmailShell(bodies[variant], ctaLabels[variant], urgencyColors[variant], `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`),
  };
}

function buildPostTrialEmail(displayName: string, variant: "day2" | "day5"): { subject: string; html: string } {
  if (variant === "day2") {
    return {
      subject: "Your account is inactive",
      html: buildEmailShell(`
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">Hey ${displayName},</p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
          Your account is now inactive.
        </p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
          Your data is still safe, but access is restricted.
        </p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
          You've already done the work — don't lose access to it.
        </p>`, "Reactivate your account", "#f59e0b", "Account inactive"),
    };
  }

  const discountedAnnual = (ANNUAL_PRICE * (1 - DISCOUNT_20)).toFixed(2);
  return {
    subject: "Come back and save 20% (48 hours only)",
    html: buildEmailShell(`
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">Hey ${displayName},</p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        If you return within the next 48 hours, you'll receive:
      </p>
      <div style="background:linear-gradient(135deg,#065f46,#047857);border:1px solid #10b981;border-radius:12px;padding:24px;margin:0 0 20px;text-align:center;">
        <p style="color:#10b981;font-size:28px;font-weight:bold;margin:0;">20% OFF</p>
        <p style="color:#94a3b8;font-size:13px;margin:6px 0 0;">Annual Plan</p>
        <p style="color:#f8fafc;font-size:18px;font-weight:bold;margin:8px 0 0;">$${discountedAnnual}/year</p>
        <p style="color:#64748b;font-size:12px;text-decoration:line-through;margin:4px 0 0;">$${ANNUAL_PRICE}.00/year</p>
      </div>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">
        This includes full access to:
      </p>
      <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0 0 16px;padding-left:20px;">
        <li>Budget and net worth tracking</li>
        <li>Secure document storage</li>
        <li>Estate planning tools</li>
      </ul>
      <p style="color:#ef4444;font-size:13px;font-weight:bold;margin:0 0 24px;">
        ⏰ This offer expires in 48 hours.
      </p>`, "Reactivate with 20% off", "#10b981", "🎉 Exclusive 48-hour offer"),
  };
}

function buildEmailShell(bodyContent: string, ctaLabel: string, accentColor: string, badge: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #334155;border-radius:16px;padding:40px;text-align:center;">
      <div style="width:60px;height:60px;background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:white;">✦</span>
      </div>
      
      <div style="display:inline-block;background:${accentColor}20;border:1px solid ${accentColor}40;border-radius:20px;padding:6px 16px;margin-bottom:20px;">
        <span style="color:${accentColor};font-size:13px;font-weight:bold;">${badge}</span>
      </div>

      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;text-align:left;">
        ${bodyContent}
      </div>

      <a href="https://dough-dreams-docket.lovable.app" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:14px;margin-bottom:24px;">
        ${ctaLabel}
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

    // Get all users with trial or pro plans that have an expiration date
    const { data: subs, error: subError } = await adminClient
      .from("user_subscriptions")
      .select("user_id, tier, trial_expires_at")
      .not("trial_expires_at", "is", null);

    if (subError) throw subError;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: "No users to process", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const sentEmails: string[] = [];

    for (const sub of subs) {
      const expiresAt = new Date(sub.trial_expires_at);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceExpiry = -daysLeft; // positive after expiration

      let reminderType: string | null = null;
      let emailContent: { subject: string; html: string } | null = null;

      // Get user info early
      const { data: authUser } = await adminClient.auth.admin.getUserById(sub.user_id);
      if (!authUser?.user?.email) continue;

      const { data: profile } = await adminClient
        .from("profiles")
        .select("display_name")
        .eq("user_id", sub.user_id)
        .maybeSingle();
      const displayName = profile?.display_name || authUser.user.email.split("@")[0];

      // PRE-EXPIRATION: Trial emails
      if (sub.tier === "trial_30" || sub.tier === "pro") {
        if (daysLeft >= 1 && daysLeft <= 2) {
          reminderType = "day29";
          emailContent = buildTrialEmail(displayName, daysLeft, "day29");
        } else if (daysLeft >= 3 && daysLeft <= 5) {
          reminderType = "day26";
          emailContent = buildTrialEmail(displayName, daysLeft, "day26");
        } else if (daysLeft >= 7 && daysLeft <= 10) {
          reminderType = "day21";
          emailContent = buildTrialEmail(displayName, daysLeft, "day21");
        }
      }

      // POST-EXPIRATION: Only for free tier (expired)
      if (sub.tier === "free") {
        if (daysSinceExpiry >= 1 && daysSinceExpiry <= 3) {
          reminderType = "post_day2";
          emailContent = buildPostTrialEmail(displayName, "day2");
        } else if (daysSinceExpiry >= 4 && daysSinceExpiry <= 6) {
          reminderType = "post_day5";
          emailContent = buildPostTrialEmail(displayName, "day5");

          // Store discount window: 48 hours from now
          await adminClient.from("user_subscriptions")
            .update({
              discount_expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
            } as any)
            .eq("user_id", sub.user_id);
        }
      }

      if (!reminderType || !emailContent) continue;

      // Check if already sent
      const { data: existing } = await adminClient
        .from("plan_reminder_log")
        .select("id")
        .eq("user_id", sub.user_id)
        .eq("reminder_type", reminderType)
        .maybeSingle();

      if (existing) continue;

      // Send email via magic link trigger
      await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ email: authUser.user.email }),
      });

      // Log reminder
      await adminClient.from("plan_reminder_log").insert({
        user_id: sub.user_id,
        reminder_type: reminderType,
      });

      sentEmails.push(`${authUser.user.email} (${reminderType})`);
    }

    return new Response(JSON.stringify({
      message: `Sent ${sentEmails.length} reminders`,
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
