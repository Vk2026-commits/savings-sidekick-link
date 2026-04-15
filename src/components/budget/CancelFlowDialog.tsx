import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Shield, Pause, CalendarCheck, ArrowRight, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CancelFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

type Step = "options" | "retention" | "reason" | "confirm";

const CANCEL_REASONS = [
  "Too expensive",
  "Not using enough",
  "Didn't understand value",
  "Other",
];

export default function CancelFlowDialog({ open, onOpenChange, onCancelled }: CancelFlowDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("options");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const resetAndClose = () => {
    setStep("options");
    setReason("");
    onOpenChange(false);
  };

  const handlePause = async () => {
    if (!user) return;
    setProcessing(true);
    // Set a 30-day pause by updating trial_expires_at to 30 days from now
    const pauseUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("user_subscriptions" as any)
      .update({ tier: "pro", trial_expires_at: pauseUntil } as any)
      .eq("user_id", user.id);
    toast({ title: "Account paused", description: "Your account is paused for 30 days. You retain full access during this period." });
    setProcessing(false);
    resetAndClose();
  };

  const handleSwitchAnnual = async () => {
    // For now, show retention offer with 20% off annual
    setStep("retention");
  };

  const handleStayAndSave = async () => {
    if (!user) return;
    setProcessing(true);
    // Apply 20% discount - set discount_expires_at for 48 hours
    const discountExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    await supabase.from("user_subscriptions" as any)
      .update({ discount_expires_at: discountExpiry } as any)
      .eq("user_id", user.id);
    toast({ title: "20% discount applied!", description: "Your 20% annual plan discount is ready. Complete checkout within 48 hours." });
    setProcessing(false);
    resetAndClose();
  };

  const handleFinalCancel = async () => {
    if (!user) return;
    setProcessing(true);
    // Set discount window for reactivation
    const discountExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    await supabase.from("user_subscriptions" as any)
      .update({ tier: "free", discount_expires_at: discountExpiry } as any)
      .eq("user_id", user.id);
    toast({ title: "Plan cancelled", description: "Your data is saved. You can reactivate anytime to restore full access." });
    setProcessing(false);
    resetAndClose();
    onCancelled();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        {step === "options" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Not ready to leave?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <button
                onClick={handlePause}
                disabled={processing}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Pause className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Pause account for 30 days</p>
                  <p className="text-xs text-muted-foreground">Keep your data, take a break</p>
                </div>
              </button>

              <button
                onClick={handleSwitchAnnual}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Switch to annual plan</p>
                  <p className="text-xs text-muted-foreground">Best value — save ~17%</p>
                </div>
              </button>

              <button
                onClick={() => setStep("retention")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-destructive/30 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Continue cancellation</p>
                </div>
              </button>
            </div>
          </>
        )}

        {step === "retention" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Keep everything you've built</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                You've already organized your financial life and important documents. Don't lose access.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <Crown className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-bold text-lg">20% off the annual plan</p>
                <p className="text-sm text-muted-foreground">if you stay today</p>
                <p className="text-2xl font-bold text-primary mt-2">$79.20<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                <p className="text-xs text-muted-foreground line-through">$99.00/year</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleStayAndSave} disabled={processing} className="flex-1 bg-primary">
                  Stay & Save 20%
                </Button>
                <Button variant="outline" onClick={() => setStep("reason")} className="flex-1">
                  Continue cancellation
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "reason" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Help us improve (optional)</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <RadioGroup value={reason} onValueChange={setReason}>
                {CANCEL_REASONS.map((r) => (
                  <div key={r} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                    <RadioGroupItem value={r} id={r} />
                    <Label htmlFor={r} className="text-sm cursor-pointer flex-1">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("retention")} className="flex-1">
                  Back
                </Button>
                <Button variant="destructive" onClick={() => setStep("confirm")} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Confirm cancellation</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground">Your data will remain safe, but access will be restricted.</p>
                    <p className="text-sm text-muted-foreground mt-1">You can reactivate anytime to restore everything instantly.</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("retention")} className="flex-1">
                  Keep my plan
                </Button>
                <Button variant="destructive" onClick={handleFinalCancel} disabled={processing} className="flex-1">
                  Cancel plan
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
