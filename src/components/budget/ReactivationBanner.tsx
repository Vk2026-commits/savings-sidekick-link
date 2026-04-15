import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PartyPopper, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReactivationBannerProps {
  expiredFromPro: boolean;
}

export default function ReactivationBanner({ expiredFromPro }: ReactivationBannerProps) {
  const { user } = useAuth();
  const [discountAvailable, setDiscountAvailable] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || !expiredFromPro) return;
    (async () => {
      const { data } = await supabase
        .from("user_subscriptions" as any)
        .select("discount_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        const row = data as any;
        if (row.discount_expires_at) {
          const expires = new Date(row.discount_expires_at);
          const now = new Date();
          if (expires > now) {
            setDiscountAvailable(true);
            setHoursLeft(Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
          }
        }
      }
    })();
  }, [user, expiredFromPro]);

  if (!expiredFromPro || dismissed) return null;

  if (discountAvailable) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/30 rounded-xl p-4 flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <PartyPopper className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Welcome back — your data is ready</p>
          <p className="text-sm text-muted-foreground mt-1">
            Save 20% on the annual plan. This offer expires in <strong className="text-foreground">{hoursLeft} hours</strong>.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-primary">$79.20/year</span>
            <span className="text-sm text-muted-foreground line-through">$99.00/year</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Reactivate with 20% off
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)} className="text-xs">
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Clock className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">Welcome back — your data is ready</p>
        <p className="text-sm text-muted-foreground mt-1">
          All your data is safely saved. Upgrade anytime to regain full access and continue where you left off.
        </p>
      </div>
      <Button size="sm" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white">
        Upgrade
      </Button>
    </div>
  );
}
