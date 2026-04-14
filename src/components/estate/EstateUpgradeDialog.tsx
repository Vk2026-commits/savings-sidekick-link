import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Sparkles } from "lucide-react";

interface EstateUpgradeDialogProps {
  label: string; // e.g. "Add Person"
}

export default function EstateUpgradeDialog({ label }: EstateUpgradeDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" /> {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Upgrade to Pro</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">
              You've reached the free plan limit of <strong>1 entry</strong> per section. Upgrade to the Pro plan for unlimited entries across all Estate & Legacy tabs.
            </p>
            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 gap-2">
              <Sparkles className="h-4 w-4" />
              Upgrade Now — $9.99/mo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
