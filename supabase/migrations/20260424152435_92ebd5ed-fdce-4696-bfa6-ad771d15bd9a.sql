-- Faith devotional completion log
CREATE TABLE public.faith_devotional_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  devotional_date TEXT NOT NULL, -- YYYY-MM-DD
  devotional_id TEXT NOT NULL,
  reflection TEXT DEFAULT '',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, devotional_date)
);
ALTER TABLE public.faith_devotional_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own faith_devotional_log" ON public.faith_devotional_log
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_faith_devotional_log_updated
  BEFORE UPDATE ON public.faith_devotional_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Onboarding answers (12-pillar flow). One row per user.
CREATE TABLE public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  completed BOOLEAN NOT NULL DEFAULT false,
  season TEXT DEFAULT '',           -- e.g. "budget", "debt", "save", "invest", "legacy", "discipline"
  goals TEXT[] NOT NULL DEFAULT '{}',-- multi-select goals
  first_action TEXT DEFAULT '',     -- chosen first action key
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own user_onboarding" ON public.user_onboarding
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_user_onboarding_updated
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();