
CREATE TABLE public.plan_reminder_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reminder_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_plan_reminder_unique ON public.plan_reminder_log (user_id, reminder_type);
