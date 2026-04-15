import { AlertTriangle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpiredPlanBannerProps {
  trialExpiresAt?: string | null;
  tier?: string;
}

export default function ExpiredPlanBanner({ trialExpiresAt, tier }: ExpiredPlanBannerProps) {
  const isExpiredTrial = (tier === "free") && trialExpiresAt;
  const wasTrialOrPro = isExpiredTrial;

  if (!wasTrialOrPro) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">Your Pro plan has expired</p>
        <p className="text-sm text-muted-foreground mt-1">
          Don't worry — all your data is safely saved. You can still view everything you've added.
          Upgrade anytime to regain full access and continue adding entries.
        </p>
      </div>
      <Button size="sm" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white">
        <Crown className="h-3.5 w-3.5 mr-1.5" /> Upgrade
      </Button>
    </div>
  );
}
