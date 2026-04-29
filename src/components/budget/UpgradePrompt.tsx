import { Lock, Shield, Crown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";

interface UpgradePromptProps {
  message?: string;
  className?: string;
  showPricing?: boolean;
}

const VALUE_BULLETS = [
  "Budget tracking",
  "Net worth dashboard",
  "Secure document storage",
  "Insurance and beneficiary tracking",
  "Estate planning hub",
];

const TRUST_ITEMS = [
  "Bank-level encryption",
  "Your data is private",
  "No selling of information",
];

export default function UpgradePrompt({ message, className = "", showPricing = false }: UpgradePromptProps) {
  const { openCheckout, loading } = usePaddleCheckout();
  if (showPricing) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-4 text-center space-y-8 ${className}`}>
        <div>
          <h2 className="text-2xl font-bold mb-2">All your financial life and estate plan — in one secure place</h2>
          <p className="text-muted-foreground">Track, organize, and protect everything that matters</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          {/* Monthly */}
          <div className="flex-1 border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Monthly</p>
            <p className="text-3xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <Button className="mt-4 w-full" variant="outline" disabled={loading} onClick={() => openCheckout("pro_monthly")}>Choose Monthly</Button>
          </div>

          {/* Annual */}
          <div className="flex-1 border-2 border-primary rounded-xl p-6 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>
            <p className="text-sm text-muted-foreground mb-1">Annual</p>
            <p className="text-3xl font-bold text-primary">$99<span className="text-sm font-normal text-muted-foreground">/year</span></p>
            <p className="text-xs text-muted-foreground mt-1">Save ~17%</p>
            <Button className="mt-4 w-full bg-primary" disabled={loading} onClick={() => openCheckout("pro_annual")}>Choose Annual</Button>
          </div>
        </div>

        <div className="text-left max-w-sm space-y-2">
          {VALUE_BULLETS.map((bullet) => (
            <div key={bullet} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {TRUST_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="max-w-md">
          <p className="text-sm text-muted-foreground italic">
            If something happened tomorrow, would your family know where everything is?
          </p>
        </div>

        <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 text-lg px-8" disabled={loading} onClick={() => openCheckout("pro_annual")}>
          Start your 30-day free trial
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
      <p className="text-muted-foreground text-sm mb-2 max-w-sm">{message || "Upgrade to Pro to unlock this feature"}</p>
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <Button variant="outline" size="sm" disabled={loading} onClick={() => openCheckout("pro_monthly")}>
          $9.99/mo
        </Button>
        <Button className="bg-primary" size="sm" disabled={loading} onClick={() => openCheckout("pro_annual")}>
          <Crown className="h-3.5 w-3.5 mr-1" />
          $99/year — Save 17%
        </Button>
      </div>
    </div>
  );
}
