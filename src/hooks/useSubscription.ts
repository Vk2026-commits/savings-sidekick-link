import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionTier = "free" | "pro";

export const FREE_LIMITS = {
  budgetItems: 3,
  estateEntriesPerTab: 1,
};

export function useSubscription() {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setTier("free"); setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("user_subscriptions" as any)
        .select("tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setTier((data as any).tier === "pro" ? "pro" : "free");
      } else {
        // Seed a free-tier record
        await supabase.from("user_subscriptions" as any).insert({ user_id: user.id, tier: "free" });
        setTier("free");
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  const isPro = tier === "pro";
  const isFree = tier === "free";

  return { tier, isPro, isFree, loading };
}
