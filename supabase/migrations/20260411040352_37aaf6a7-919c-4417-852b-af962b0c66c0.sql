
CREATE TABLE public.user_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pin"
ON public.user_pins
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_pins_updated_at
BEFORE UPDATE ON public.user_pins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
