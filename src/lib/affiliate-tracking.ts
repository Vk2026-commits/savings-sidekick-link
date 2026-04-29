import { supabase } from "@/integrations/supabase/client";

const REF_STORAGE_KEY = "fn_ref";
const REF_TIMESTAMP_KEY = "fn_ref_ts";
const ATTRIBUTION_DAYS = 60;

/**
 * Capture ?ref= from URL on landing. Logs the click and stores the code
 * in localStorage for up to 60 days so we can attribute on signup.
 */
export async function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return;

  // Store for attribution window
  localStorage.setItem(REF_STORAGE_KEY, ref);
  localStorage.setItem(REF_TIMESTAMP_KEY, Date.now().toString());

  // Look up partner & log click (last-click attribution overwrites any prior)
  const { data: partner } = await supabase
    .from("affiliate_partners")
    .select("id, status")
    .eq("referral_code", ref)
    .maybeSingle();

  if (partner && partner.status === "active") {
    await supabase.from("affiliate_clicks").insert({
      partner_id: partner.id,
      referral_code: ref,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      landing_page: window.location.pathname,
    });
  }
}

/**
 * Get the stored referral code if it's still inside the attribution window.
 */
export function getStoredReferral(): string | null {
  if (typeof window === "undefined") return null;
  const code = localStorage.getItem(REF_STORAGE_KEY);
  const ts = localStorage.getItem(REF_TIMESTAMP_KEY);
  if (!code || !ts) return null;
  const ageDays = (Date.now() - parseInt(ts, 10)) / (1000 * 60 * 60 * 24);
  if (ageDays > ATTRIBUTION_DAYS) {
    localStorage.removeItem(REF_STORAGE_KEY);
    localStorage.removeItem(REF_TIMESTAMP_KEY);
    return null;
  }
  return code;
}

/**
 * Called after successful signup to attribute the new user to a partner.
 */
export async function attributeSignup(userId: string, email: string, firstName?: string) {
  const code = getStoredReferral();
  if (!code) return;

  const { data: partner } = await supabase
    .from("affiliate_partners")
    .select("id, status")
    .eq("referral_code", code)
    .maybeSingle();

  if (!partner || partner.status !== "active") return;

  // Last-click attribution: if a referral row already exists for this user,
  // skip (UNIQUE constraint will block anyway). Otherwise insert.
  await supabase.from("affiliate_referrals").insert({
    partner_id: partner.id,
    referred_user_id: userId,
    referred_email: email,
    referred_first_name: firstName ?? null,
    conversion_status: "signed_up",
  });

  // Clear so we don't re-attribute
  localStorage.removeItem(REF_STORAGE_KEY);
  localStorage.removeItem(REF_TIMESTAMP_KEY);
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(name.length - 1, 1))}@${domain}`;
}
