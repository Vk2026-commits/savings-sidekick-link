import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import OnboardingWizard from "@/components/OnboardingWizard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function OnboardingPreview() {
  const { user, loading: authLoading } = useAuth();
  const admin = useAdmin();
  const { toast } = useToast();

  if (authLoading || admin.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!user || !admin.isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <h1 className="text-lg font-semibold">Onboarding Preview</h1>
          </div>
          <span className="text-xs text-muted-foreground">Read-only · answers are not saved</span>
        </div>
      </header>
      <OnboardingWizard
        onComplete={(answers) => {
          toast({
            title: "Preview complete",
            description: `Season: ${answers.season || "—"} · Goals: ${answers.goals.length} · First action: ${answers.firstAction || "—"}`,
          });
        }}
      />
    </div>
  );
}
