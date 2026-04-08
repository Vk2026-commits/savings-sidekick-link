ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_reconciled boolean NOT NULL DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';