import { useState } from "react";
import { Sparkles, Check, BookOpen, MessageCircle, HandHeart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFaithDevotional } from "@/hooks/useFaithDevotional";

export default function FaithCard() {
  const { devotional, completed, reflection, setReflection, markComplete, loaded, saving } = useFaithDevotional();
  const [showJournal, setShowJournal] = useState(false);

  return (
    <div className="glass-card p-4 sm:p-5 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-semibold">Faith + Finance</h3>
            {completed && (
              <span className="text-[10px] uppercase tracking-wide font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="h-3 w-3" /> Completed today
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              <BookOpen className="h-3 w-3" /> Scripture of the day
            </div>
            <p className="text-sm sm:text-base italic leading-relaxed">"{devotional.scripture}"</p>
            <p className="text-xs text-muted-foreground">— {devotional.reference}</p>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Devotional</div>
            <p className="text-sm text-foreground/90 leading-relaxed">{devotional.devotional}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-md border border-border/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                <MessageCircle className="h-3 w-3" /> Reflection
              </div>
              <p className="text-sm">{devotional.reflection}</p>
            </div>
            <div className="rounded-md border border-border/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                <HandHeart className="h-3 w-3" /> Prayer
              </div>
              <p className="text-sm">{devotional.prayer}</p>
            </div>
          </div>

          {showJournal && (
            <div className="space-y-2">
              <Textarea
                placeholder="Optional: write a short reflection for today…"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {!completed ? (
              <>
                <Button
                  size="sm"
                  onClick={() => markComplete()}
                  disabled={!loaded || saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Mark complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowJournal((s) => !s)}
                >
                  {showJournal ? "Hide journal" : "Add reflection"}
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowJournal((s) => !s)}>
                  {showJournal ? "Hide journal" : reflection ? "Edit reflection" : "Add reflection"}
                </Button>
                {showJournal && (
                  <Button size="sm" onClick={() => markComplete()} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                    Save reflection
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
