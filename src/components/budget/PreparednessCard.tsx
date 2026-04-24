import { ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePreparedness, type PreparednessItem } from "@/hooks/usePreparedness";

interface PreparednessCardProps {
  onNavigate?: (tab: string) => void;
  onOpenChecklist?: () => void;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-rose-500";
}

export default function PreparednessCard({ onNavigate, onOpenChecklist }: PreparednessCardProps) {
  const { score, recommendations, loaded } = usePreparedness();

  return (
    <div className="glass-card p-4 sm:p-5 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold">Preparedness Score</h3>
              <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${scoreColor(score)}`}>
                {loaded ? score : "—"}<span className="text-sm font-normal text-muted-foreground">/100</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 italic">
              "If something happened tomorrow, would everything be in order?" Faithnancial helps you organize your financial life so your family is prepared.
            </p>
          </div>

          <Progress value={score} className="h-2" />

          {recommendations.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Sparkles className="h-3 w-3" /> Improve your score
              </div>
              <div className="space-y-1">
                {recommendations.map((rec) => (
                  <RecommendationRow key={rec.key} rec={rec} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}

          {onOpenChecklist && (
            <div className="pt-1">
              <Button variant="outline" size="sm" onClick={onOpenChecklist} className="text-xs">
                View family readiness checklist
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationRow({ rec, onNavigate }: { rec: PreparednessItem; onNavigate?: (tab: string) => void }) {
  const clickable = !!rec.ctaTab && !!onNavigate;
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onNavigate!(rec.ctaTab!)}
      className={`w-full text-left flex items-start justify-between gap-2 p-2 rounded-md border border-border/50 ${
        clickable ? "hover:bg-muted/50 transition-colors cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{rec.label}</div>
        <div className="text-xs text-muted-foreground line-clamp-2">{rec.description}</div>
      </div>
      {clickable && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
    </button>
  );
}
