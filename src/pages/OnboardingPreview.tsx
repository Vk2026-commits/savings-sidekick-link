import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import OnboardingWizard from "@/components/OnboardingWizard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RotateCcw } from "lucide-react";

const PREVIEW_KEY = "faithnancial_onboarding_preview";

interface PreviewSave {
  season: string;
  goals: string[];
  firstAction: string;
  savedAt: string;
}

export default function OnboardingPreview() {
  const { user, loading: authLoading } = useAuth();
  const admin = useAdmin();
  const { toast } = useToast();
  const [testSaveMode, setTestSaveMode] = useState(false);
  const [lastSave, setLastSave] = useState<PreviewSave | null>(null);
  const [wizardKey, setWizardKey] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(PREVIEW_KEY);
    if (raw) {
      try { setLastSave(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  if (authLoading || admin.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!user || !admin.isAdmin) return <Navigate to="/" replace />;

  const handleComplete = (answers: { season: string; goals: string[]; firstAction: string }) => {
    if (testSaveMode) {
      const payload: PreviewSave = { ...answers, savedAt: new Date().toISOString() };
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
      setLastSave(payload);
      toast({
        title: "Test save complete",
        description: "Saved to local preview storage. Your real onboarding data was not touched.",
      });
    } else {
      toast({
        title: "Preview complete (read-only)",
        description: `Season: ${answers.season || "—"} · Goals: ${answers.goals.length} · First action: ${answers.firstAction || "—"}`,
      });
    }
  };

  const clearTestSave = () => {
    localStorage.removeItem(PREVIEW_KEY);
    setLastSave(null);
    setWizardKey((k) => k + 1);
    toast({ title: "Cleared", description: "Test save data removed." });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <h1 className="text-lg font-semibold">Onboarding Preview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="test-save-mode"
                checked={testSaveMode}
                onCheckedChange={setTestSaveMode}
              />
              <Label htmlFor="test-save-mode" className="text-sm cursor-pointer">
                {testSaveMode ? "Test save mode" : "Read-only mode"}
              </Label>
            </div>
            {lastSave && (
              <Button variant="outline" size="sm" onClick={clearTestSave}>
                <RotateCcw className="h-3 w-3 mr-1" /> Clear test data
              </Button>
            )}
          </div>
        </div>
        <div className="container max-w-5xl mx-auto px-4 pb-3">
          <p className="text-xs text-muted-foreground">
            {testSaveMode
              ? "Test save mode: answers persist to local preview storage only — the real user record is never modified."
              : "Read-only mode: answers are not saved anywhere."}
            {lastSave && (
              <span className="ml-2">
                · Last test save: {new Date(lastSave.savedAt).toLocaleString()}
              </span>
            )}
          </p>
        </div>
      </header>
      <OnboardingWizard key={wizardKey} onComplete={handleComplete} />
    </div>
  );
}
