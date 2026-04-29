-- Track partner agreement acceptance
CREATE TABLE public.affiliate_agreement_acceptances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL,
  user_id uuid NOT NULL,
  agreement_version text NOT NULL DEFAULT 'v1.0-2026-04-29',
  signature_name text NOT NULL,
  signature_date timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_agreement_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners view own acceptances"
  ON public.affiliate_agreement_acceptances
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Partners insert own acceptances"
  ON public.affiliate_agreement_acceptances
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND partner_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins view all acceptances"
  ON public.affiliate_agreement_acceptances
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_agreement_acceptances_partner ON public.affiliate_agreement_acceptances(partner_id);
CREATE INDEX idx_agreement_acceptances_user ON public.affiliate_agreement_acceptances(user_id);
