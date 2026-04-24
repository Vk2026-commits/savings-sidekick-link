import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ChevronRight, Check, Target, PiggyBank, TrendingDown,
  HandCoins, LineChart, ScrollText, BookOpen, Users, Map,
} from "lucide-react";

interface OnboardingAnswers {
  season: string;
  goals: string[];
  firstAction: string;
}

interface OnboardingWizardProps {
  onComplete: (answers: OnboardingAnswers) => Promise<void> | void;
}

const SEASONS = [
  { id: "budget",     label: "I'm trying to budget better",       icon: Target },
  { id: "debt",       label: "I'm trying to get out of debt",     icon: TrendingDown },
  { id: "save",       label: "I'm trying to save consistently",   icon: PiggyBank },
  { id: "invest",     label: "I'm ready to invest",               icon: LineChart },
  { id: "legacy",     label: "I'm building legacy & estate plans",icon: ScrollText },
  { id: "discipline", label: "I want faith-based discipline",     icon: Sparkles },
];

const GOALS = [
  { id: "create_budget",  label: "Create a budget" },
  { id: "save_money",     label: "Save money" },
  { id: "pay_debt",       label: "Pay down debt" },
  { id: "give",           label: "Give / tithe consistently" },
  { id: "build_assets",   label: "Build assets" },
  { id: "join_group",     label: "Join an accountability group" },
  { id: "invest_comm",    label: "Invest with community" },
  { id: "build_legacy",   label: "Build legacy" },
];

interface RoadmapStep { key: string; label: string; }

function buildRoadmap(answers: OnboardingAnswers): RoadmapStep[] {
  // Canonical order: Budget → Save → Debt → Giving → Investing → Assets → Legacy
  const all: RoadmapStep[] = [
    { key: "budget",  label: "Budget" },
    { key: "save",    label: "Save" },
    { key: "debt",    label: "Debt reduction" },
    { key: "give",    label: "Giving" },
    { key: "invest",  label: "Investing" },
    { key: "assets",  label: "Assets" },
    { key: "legacy",  label: "Legacy" },
  ];
  // Promote the user's chosen season to the front (after foundational steps).
  const promote = answers.season;
  if (!promote) return all;
  const idx = all.findIndex((s) => s.key === promote);
  if (idx <= 0) return all;
  // Always keep "budget" first; promote chosen season just after budget.
  const reordered = [...all];
  const [picked] = reordered.splice(idx, 1);
  reordered.splice(1, 0, picked);
  return reordered;
}

const FIRST_ACTIONS = [
  { id: "spending_goal",  label: "Set a spending goal",                icon: Target,    tab: "budget" },
  { id: "giving_goal",    label: "Create a giving goal",               icon: HandCoins, tab: "budget" },
  { id: "devotional",     label: "Read today's devotional",            icon: BookOpen,  tab: "dashboard" },
  { id: "roadmap",        label: "View my financial roadmap",          icon: Map,       tab: "dashboard" },
  { id: "group",          label: "Join an accountability group",       icon: Users,     tab: "dashboard" },
];

const TOTAL_STEPS = 5;

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [season, setSeason] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [firstAction, setFirstAction] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;
  const roadmap = useMemo(() => buildRoadmap({ season, goals, firstAction }), [season, goals, firstAction]);

  const toggleGoal = (id: string) =>
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const finish = async () => {
    setSubmitting(true);
    try {
      await onComplete({ season, goals, firstAction });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg space-y-6">
        {step > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-5">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">Welcome to Faithnancial</h2>
                <p className="text-sm md:text-base text-muted-foreground italic">
                  Where Faith Meets Financial Freedom
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Faithnancial is built on <span className="font-semibold text-foreground">12 pillars</span> of faith,
                stewardship, discipline, community, investing, and legacy — designed to grow you spiritually,
                financially, and collectively.
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-left">
                <p className="text-[11px] uppercase tracking-wide font-medium text-primary mb-2">The 12 Pillars</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Faith · Accountability · Intentionality · Tithing · Humility · Network ·
                  Assets · Navigation · Consistency · Investing · Abundance · Legacy
                </p>
              </div>
              <Button size="lg" className="w-full" onClick={() => setStep(2)}>
                Get Started <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Choose Your Financial Season */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">Choose Your Financial Season</h2>
                <p className="text-xs text-muted-foreground">Pick the one that fits you best right now.</p>
              </div>
              <div className="space-y-2">
                {SEASONS.map((s) => {
                  const Icon = s.icon;
                  const selected = season === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSeason(s.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium flex-1">{s.label}</span>
                      {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <Button className="w-full" disabled={!season} onClick={() => setStep(3)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 3: Set Your Faith + Finance Goals */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">Set Your Faith + Finance Goals</h2>
                <p className="text-xs text-muted-foreground">Choose all that apply.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GOALS.map((g) => {
                  const selected = goals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                        selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                        selected ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="text-sm">{g.label}</span>
                    </button>
                  );
                })}
              </div>
              <Button className="w-full" disabled={goals.length === 0} onClick={() => setStep(4)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 4: Create Your Personal Roadmap */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">Your Personal Roadmap</h2>
                <p className="text-xs text-muted-foreground">
                  Based on your answers, here's the path we recommend.
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <ol className="space-y-2">
                  {roadmap.map((step, i) => (
                    <li key={step.key} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium">{step.label}</span>
                      {i < roadmap.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 ml-auto" />}
                    </li>
                  ))}
                </ol>
              </div>
              <p className="text-xs text-muted-foreground italic text-center">
                You can always adjust your path as your season changes.
              </p>
              <Button className="w-full" onClick={() => setStep(5)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 5: First Action */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">Start your first action</h2>
                <p className="text-xs text-muted-foreground">Pick one to begin (you can do the rest later).</p>
              </div>
              <div className="space-y-2">
                {FIRST_ACTIONS.map((a) => {
                  const Icon = a.icon;
                  const selected = firstAction === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setFirstAction(a.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium flex-1">{a.label}</span>
                      {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <Button className="w-full" disabled={!firstAction || submitting} onClick={finish}>
                {submitting ? "Setting up…" : "Go to Dashboard"} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <button
                type="button"
                disabled={submitting}
                onClick={finish}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
