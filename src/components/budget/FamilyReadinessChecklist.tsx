import { Check, ChevronRight, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { usePreparedness, type PreparednessItem } from "@/hooks/usePreparedness";

interface FamilyReadinessChecklistProps {
  onNavigate?: (tab: string) => void;
  defaultOpen?: boolean;
}

const CATEGORY_LABELS: Record<PreparednessItem["category"], string> = {
  financial: "Financial foundations",
  legal: "Legal & legacy",
  family: "Family readiness",
};

export default function FamilyReadinessChecklist({ onNavigate, defaultOpen = false }: FamilyReadinessChecklistProps) {
  const { items, toggleManual } = usePreparedness();
  const [open, setOpen] = useState(defaultOpen);

  const grouped = items.reduce<Record<string, PreparednessItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  const completedCount = items.filter(i => i.isComplete).length;

  return (
    <div className="glass-card overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2 text-left">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">Family Readiness Checklist</div>
              <div className="text-xs text-muted-foreground">{completedCount} of {items.length} complete</div>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-3">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[cat as PreparednessItem["category"]]}
                </div>
                <div className="space-y-1">
                  {list.map((item) => (
                    <ChecklistRow key={item.key} item={item} onNavigate={onNavigate} onToggle={toggleManual} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function ChecklistRow({
  item,
  onNavigate,
  onToggle,
}: {
  item: PreparednessItem;
  onNavigate?: (tab: string) => void;
  onToggle: (key: any, value: boolean) => void;
}) {
  return (
    <div className={`flex items-start gap-3 p-2 rounded-md border border-border/40 ${item.isComplete ? "bg-emerald-500/5 border-emerald-500/20" : ""}`}>
      {item.isManual ? (
        <Checkbox
          checked={item.isComplete}
          onCheckedChange={(v) => onToggle(item.key, !!v)}
          className="mt-0.5"
        />
      ) : (
        <div className="mt-0.5" title="Auto-detected from your data">
          {item.isComplete ? (
            <div className="h-4 w-4 rounded-sm bg-emerald-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="h-4 w-4 rounded-sm border border-muted-foreground/40 flex items-center justify-center">
              <Lock className="h-2.5 w-2.5 text-muted-foreground/60" />
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${item.isComplete ? "line-through text-muted-foreground" : ""}`}>
          {item.label}
        </div>
        <div className="text-xs text-muted-foreground">{item.description}</div>
      </div>
      {!item.isComplete && item.ctaTab && onNavigate && (
        <button
          onClick={() => onNavigate(item.ctaTab!)}
          className="text-xs text-primary hover:underline shrink-0 mt-0.5"
        >
          Go
        </button>
      )}
    </div>
  );
}
