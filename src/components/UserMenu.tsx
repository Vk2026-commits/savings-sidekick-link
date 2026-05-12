import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Shield, ScrollText, Crown, XCircle, FileText, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/hooks/useAdmin";
import { useSubscription } from "@/hooks/useSubscription";
import CancelFlowDialog from "@/components/budget/CancelFlowDialog";
import UpgradePrompt from "@/components/budget/UpgradePrompt";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isPro, isTrial, tier } = useSubscription();
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isPartner, setIsPartner] = useState(false);

  useEffect(() => {
    if (!user) { setIsPartner(false); return; }
    supabase
      .from("affiliate_partners")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => setIsPartner(!!data));
  }, [user]);

  if (!user) return null;

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="text-xs text-muted-foreground">{user.email}</DropdownMenuItem>
          <DropdownMenuItem className="text-xs text-muted-foreground">
            Plan: {tier === "trial_30" ? "Trial" : tier === "pro" ? "Pro" : "Free"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              <Shield className="h-4 w-4 mr-2" /> Admin Portal
            </DropdownMenuItem>
          )}
          {(isPartner || isAdmin) && (
            <DropdownMenuItem onClick={() => navigate("/partner-dashboard")}>
              <Handshake className="h-4 w-4 mr-2" /> Partner Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => navigate("/estate")}>
            <ScrollText className="h-4 w-4 mr-2" /> Estate & Legacy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!isPro && (
            <DropdownMenuItem onClick={() => setUpgradeOpen(true)} className="text-primary">
              <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
            </DropdownMenuItem>
          )}
          {isPro && (
            <DropdownMenuItem onClick={() => setCancelOpen(true)} className="text-muted-foreground">
              <XCircle className="h-4 w-4 mr-2" /> Cancel Plan
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => navigate("/policies")}>
            <FileText className="h-4 w-4 mr-2" /> Terms & Policies
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CancelFlowDialog open={cancelOpen} onOpenChange={setCancelOpen} onCancelled={() => setCancelOpen(false)} />

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <UpgradePrompt showPricing />
        </DialogContent>
      </Dialog>
    </>
  );
}
