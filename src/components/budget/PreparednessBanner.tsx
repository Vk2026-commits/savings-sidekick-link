import { ShieldCheck } from "lucide-react";

export default function PreparednessBanner() {
  return (
    <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <ShieldCheck className="h-4 w-4 text-primary" />
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground italic leading-snug">
        <span className="font-medium text-foreground not-italic">If something happened tomorrow, would everything be in order? </span>
        Faithnancial helps you organize your financial life so your family is prepared.
      </div>
    </div>
  );
}
