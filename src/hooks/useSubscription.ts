import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionTier = "free" | "pro" | "trial_30";

export const FREE_LIMITS = {
  budgetItems: 3,
  estateEntriesPerTab: 1,
};

export function useSubscription() {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(null);
  const [expiredFromPro, setExpiredFromPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setTier("free"); setTrialExpiresAt(null); setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("user_subscriptions" as any)
        .select("tier, trial_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        const row = data as any;
        const t = row.tier as string;
        
        // Check if trial has expired
        if (t === "trial_30" && row.trial_expires_at) {
          const expiresAt = new Date(row.trial_expires_at);
          if (expiresAt < new Date()) {
            // Trial expired — revert to free but keep trial_expires_at for banner
            await supabase.from("user_subscriptions" as any)
              .update({ tier: "free" } as any)
              .eq("user_id", user.id);
            setTier("free");
            setTrialExpiresAt(row.trial_expires_at);
            setExpiredFromPro(true);
            setLoading(false);
            return;
          }
          setTrialExpiresAt(row.trial_expires_at);
        } else if (t === "free" && row.trial_expires_at) {
          // Was previously on a trial that expired
          setTrialExpiresAt(row.trial_expires_at);
          setExpiredFromPro(true);
        }
        
        setTier(["pro", "trial_30"].includes(t) ? t as SubscriptionTier : "free");
      } else {
        await supabase.from("user_subscriptions" as any).insert({ user_id: user.id, tier: "free" });
        setTier("free");
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  const isPro = tier === "pro" || tier === "trial_30";
  const isFree = !isPro;
  const isTrial = tier === "trial_30";

  return { tier, isPro, isFree, isTrial, trialExpiresAt, expiredFromPro, loading };
}
