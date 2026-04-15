import { FileText, UserCheck, Shield, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const quickActions = [
  { icon: FileText, label: "Upload document", tab: "documents" as const },
  { icon: UserCheck, label: "Add beneficiary", tab: "beneficiaries" as const },
  { icon: Shield, label: "Add insurance", tab: "insurance" as const },
];

interface EstateCompletionBannerProps {
  onNavigate: (tab: string) => void;
}

export default function EstateCompletionBanner({ onNavigate }: EstateCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="glass-card p-4 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3 flex-1">
          <p className="text-sm font-semibold">Next step: Complete your estate profile</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <Button
                key={a.label}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onNavigate(a.tab)}
              >
                <a.icon className="h-3.5 w-3.5 mr-1.5" />
                {a.label}
              </Button>
            ))}
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
