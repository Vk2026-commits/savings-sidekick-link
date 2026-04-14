import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  message?: string;
  className?: string;
}

export default function UpgradePrompt({ message = "Upgrade to Pro to unlock this feature", className = "" }: UpgradePromptProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm">{message}</p>
      <Button className="bg-gradient-to-r from-primary to-primary/80">
        Upgrade for $9.99/mo
      </Button>
    </div>
  );
}
