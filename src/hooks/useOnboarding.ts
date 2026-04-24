import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LEGACY_LOCAL_KEY = "faithnancial_onboarded";

export interface OnboardingState {
  completed: boolean;
  season: string;
  goals: string[];
  firstAction: string;
}

export function useOnboarding() {
  const { user } = useAuth();
  const uid = user?.id;
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!uid) {
      setLoaded(false);
      return;
    }
    const { data } = await supabase
      .from("user_onboarding")
      .select("completed, season, goals, first_action")
      .eq("user_id", uid)
      .maybeSingle();

    if (data) {
      setState({
        completed: !!data.completed,
        season: data.season ?? "",
        goals: (data.goals as string[]) ?? [],
        firstAction: data.first_action ?? "",
      });
    } else {
      // Migration path: respect legacy localStorage flag so existing users don't see onboarding again.
      const legacy = typeof window !== "undefined" && localStorage.getItem(LEGACY_LOCAL_KEY);
      setState({ completed: !!legacy, season: "", goals: [], firstAction: "" });
    }
    setLoaded(true);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(
    async (next: Partial<OnboardingState> & { completed?: boolean }) => {
      if (!uid) return;
      const merged: OnboardingState = {
        completed: next.completed ?? state?.completed ?? false,
        season: next.season ?? state?.season ?? "",
        goals: next.goals ?? state?.goals ?? [],
        firstAction: next.firstAction ?? state?.firstAction ?? "",
      };
      setState(merged);
      await supabase.from("user_onboarding").upsert(
        {
          user_id: uid,
          completed: merged.completed,
          season: merged.season,
          goals: merged.goals,
          first_action: merged.firstAction,
          completed_at: merged.completed ? new Date().toISOString() : null,
        },
        { onConflict: "user_id" },
      );
      if (merged.completed && typeof window !== "undefined") {
        localStorage.setItem(LEGACY_LOCAL_KEY, "true");
      }
    },
    [uid, state],
  );

  return { state, loaded, save, refetch: load };
}
