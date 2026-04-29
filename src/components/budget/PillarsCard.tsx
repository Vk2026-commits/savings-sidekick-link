import { useMemo } from "react";
import { ChevronRight, Check } from "lucide-react";
import { PILLARS, type Pillar } from "@/data/pillars";
import { usePreparedness } from "@/hooks/usePreparedness";
import { useFaithDevotional } from "@/hooks/useFaithDevotional";

interface PillarsCardProps {
  onNavigate?: (tab: string) => void;
}

/**
 * Visual dashboard section showing all 12 Faithnancial pillars.
 * Each pillar shows: name, short description, completion status (where measurable),
 * and a link to the related app feature when one exists.
 */
export default function PillarsCard({ onNavigate }: PillarsCardProps) {
  const { items: prepItems } = usePreparedness();
  const { completed: faithDoneToday } = useFaithDevotional();

  // Map pillar -> progress (0-100) where we can derive it from existing data.
  const progressByName = useMemo(() => {
    const byKey = (k: string) => prepItems.find((i) => i.key === k)?.isComplete ?? false;

    const intentionality = prepItems
      .filter((i) => ["budget_started", "emergency_fund"].includes(i.key))
      .reduce((s, i) => s + (i.isComplete ? 50 : 0), 0);

    const tithing = byKey("giving_plan") ? 100 : 0;

    const humility = byKey("assets_tracked") || byKey("debt_plan") ? 100 : 0;

    const assets = byKey("assets_tracked") ? 100 : 0;

    const navigation = (() => {
      const total = prepItems.length || 1;
      const done = prepItems.filter((i) => i.isComplete).length;
      return Math.round((done / total) * 100);
    })();

    const legacyKeys = ["will_completed", "power_of_attorney", "beneficiaries_assigned", "insurance_recorded", "trusted_contact_assigned"];
    const legacyDone = prepItems.filter((i) => legacyKeys.includes(i.key) && i.isComplete).length;
    const legacy = Math.round((legacyDone / legacyKeys.length) * 100);

    return {
      Faith: faithDoneToday ? 100 : 0,
      Intentionality: intentionality,
      Tithing: tithing,
      Humility: humility,
      Assets: assets,
      Navigation: navigation,
      Legacy: legacy,
    } as Record<string, number>;
  }, [prepItems, faithDoneToday]);

  return (
    <div className="glass-card p-4 sm:p-5 space-y-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">The 12 Pillars</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Faith, stewardship, discipline, community, investing, and legacy — all in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {PILLARS.map((p, idx) => (
          <PillarTile
            key={`${p.name}-${idx}`}
            pillar={p}
            progress={p.hasProgress ? progressByName[p.name] ?? 0 : null}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function PillarTile({
  pillar,
  progress,
  onNavigate,
}: {
  pillar: Pillar;
  progress: number | null;
  onNavigate?: (tab: string) => void;
}) {
  const Icon = pillar.icon;
  const clickable = !!pillar.ctaTab && !!onNavigate;
  const done = progress !== null && progress >= 100;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onNavigate!(pillar.ctaTab!)}
      className={`group relative text-left rounded-lg border border-border/60 p-3 bg-card/40 transition-colors ${
        clickable ? "hover:border-primary/40 hover:bg-primary/5 cursor-pointer" : "cursor-default opacity-90"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 relative">
          <Icon className="h-4 w-4 text-primary" />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border border-border text-[9px] font-bold flex items-center justify-center text-muted-foreground">
            {pillar.letter}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold truncate">{pillar.name}</p>
            {done && <Check className="h-3 w-3 text-emerald-500 shrink-0" />}
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{pillar.description}</p>
        </div>
        {clickable && (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
        )}
      </div>
      {progress !== null && (
        <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${done ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </button>
  );
}
