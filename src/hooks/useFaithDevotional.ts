import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDevotionalForDate, todayKey, type Devotional } from "@/data/devotionals";

export function useFaithDevotional() {
  const { user } = useAuth();
  const uid = user?.id;
  const devotional: Devotional = getDevotionalForDate();
  const dateKey = todayKey();

  const [completed, setCompleted] = useState(false);
  const [reflection, setReflection] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase
      .from("faith_devotional_log")
      .select("reflection, completed_at")
      .eq("user_id", uid)
      .eq("devotional_date", dateKey)
      .maybeSingle();
    if (data) {
      setCompleted(true);
      setReflection(data.reflection ?? "");
    } else {
      setCompleted(false);
      setReflection("");
    }
    setLoaded(true);
  }, [uid, dateKey]);

  useEffect(() => { load(); }, [load]);

  const markComplete = useCallback(
    async (reflectionText?: string) => {
      if (!uid) return;
      setSaving(true);
      const text = reflectionText ?? reflection;
      const { error } = await supabase.from("faith_devotional_log").upsert(
        {
          user_id: uid,
          devotional_date: dateKey,
          devotional_id: devotional.id,
          reflection: text,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,devotional_date" },
      );
      if (!error) {
        setCompleted(true);
        setReflection(text);
      }
      setSaving(false);
    },
    [uid, dateKey, devotional.id, reflection],
  );

  return { devotional, completed, reflection, setReflection, markComplete, loaded, saving };
}
