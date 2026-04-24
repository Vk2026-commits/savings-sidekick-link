import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Landmark, FileText, ScrollText, ChevronRight, Check, Upload, ShieldCheck } from "lucide-react";

const goals = [
  { id: "budget", label: "Track my budget", icon: PiggyBank },
  { id: "accounts", label: "Organize my financial accounts", icon: Landmark },
  { id: "documents", label: "Store important documents", icon: FileText },
  { id: "estate", label: "Set up my estate plan", icon: ScrollText, highlight: true },
];

const TOTAL_STEPS = 6;

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {step > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="glass-card p-8 space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Get your financial life organized in minutes</h2>
              <p className="text-muted-foreground">Start with your finances — then secure everything that matters.</p>
              <Button size="lg" className="mt-4" onClick={() => setStep(2)}>
                Get Started <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Preparedness Message */}
          {step === 2 && (
            <div className="text-center space-y-5">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">If something happened tomorrow, would everything be in order?</h2>
              <p className="text-muted-foreground text-sm">
                Faithnancial helps you organize your financial life so your family is prepared.
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-left space-y-2">
                <p className="text-xs font-medium text-primary">What we'll help you organize</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary shrink-0" /> Your budget, bills, and savings</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary shrink-0" /> Important documents and policies</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary shrink-0" /> Estate plans and family readiness</li>
                </ul>
              </div>
              <Button size="lg" className="w-full" onClick={() => setStep(3)}>
                Got it <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 3: Goal Selection */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-center">What do you want to do first?</h2>
              <div className="space-y-3">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                      selectedGoal === g.id
                        ? "border-primary bg-primary/10"
                        : g.highlight
                          ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                          : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      g.highlight ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <g.icon className={`h-4 w-4 ${g.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-sm font-medium">{g.label}</span>
                    {g.highlight && (
                      <span className="ml-auto text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Recommended</span>
                    )}
                    {selectedGoal === g.id && <Check className="ml-auto h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={!selectedGoal} onClick={() => setStep(4)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 4: Quick Setup */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-center">Let's get you set up</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border space-y-2">
                  <p className="text-sm font-medium">Connect bank accounts</p>
                  <p className="text-xs text-muted-foreground">Securely link your accounts for automatic tracking</p>
                  <Button variant="outline" size="sm" onClick={() => setStep(5)}>Skip for now</Button>
                </div>
                <div className="p-4 rounded-lg border border-border space-y-2">
                  <p className="text-sm font-medium">Add monthly income</p>
                  <p className="text-xs text-muted-foreground">You can update this anytime from your dashboard</p>
                </div>
                <div className="p-4 rounded-lg border border-border space-y-2">
                  <p className="text-sm font-medium">Add 1 expense category</p>
                  <p className="text-xs text-muted-foreground">Start with your biggest expense — like rent or mortgage</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep(5)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 5: Estate Emphasis */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Protect what matters most</h2>
                <p className="text-sm text-muted-foreground">
                  Most people don't have their financial and legal documents in one place. Start by adding one:
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Insurance policy", desc: "Life, health, or property insurance" },
                  { label: "Will or trust document", desc: "Upload or note its location" },
                  { label: "Beneficiary information", desc: "Who inherits what" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(6)}>Skip</Button>
                <Button className="flex-1" onClick={() => setStep(6)}>
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Value Reinforcement */}
          {step === 6 && (
            <div className="text-center space-y-5">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold">You're almost set</h2>
              <p className="text-muted-foreground text-sm">
                You've started organizing:
              </p>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> Your finances
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> Your important documents
                </div>
              </div>
              <p className="text-sm text-muted-foreground">You now have one place for everything.</p>
              <Button size="lg" className="mt-2" onClick={onComplete}>
                Go to Dashboard <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
