-- Preparedness checklist (manual items the user toggles)
CREATE TABLE public.preparedness_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_key TEXT NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_key)
);

ALTER TABLE public.preparedness_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preparedness_checklist"
ON public.preparedness_checklist
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_preparedness_checklist_updated_at
BEFORE UPDATE ON public.preparedness_checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_preparedness_checklist_user ON public.preparedness_checklist(user_id);