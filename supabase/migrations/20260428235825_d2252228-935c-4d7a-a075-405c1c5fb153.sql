-- Add 'affiliate' role to existing app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'affiliate';

-- ============================================================
-- TABLE: affiliate_applications
-- ============================================================
CREATE TABLE public.affiliate_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  website text,
  partner_type text NOT NULL CHECK (partner_type IN ('attorney','cpa','financial_advisor','insurance_agent','influencer','church_community','other')),
  audience_size text,
  promotion_plan text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('ach','paypal','stripe_connect','manual','other')),
  payment_details text,
  agreement_accepted boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application"
  ON public.affiliate_applications FOR INSERT
  WITH CHECK (agreement_accepted = true);

CREATE POLICY "Admins view all applications"
  ON public.affiliate_applications FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update applications"
  ON public.affiliate_applications FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete applications"
  ON public.affiliate_applications FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_affiliate_applications_updated_at
  BEFORE UPDATE ON public.affiliate_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TABLE: affiliate_partners
-- ============================================================
CREATE TABLE public.affiliate_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  application_id uuid REFERENCES public.affiliate_applications(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  business_name text,
  partner_type text NOT NULL,
  referral_code text NOT NULL UNIQUE,
  commission_rate numeric NOT NULL DEFAULT 20.00,
  payout_duration_months integer NOT NULL DEFAULT 12,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')),
  payment_method text,
  payment_details text,
  total_clicks integer NOT NULL DEFAULT 0,
  total_signups integer NOT NULL DEFAULT 0,
  total_paid_conversions integer NOT NULL DEFAULT 0,
  notes text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_partners_referral_code ON public.affiliate_partners(referral_code);
CREATE INDEX idx_affiliate_partners_user_id ON public.affiliate_partners(user_id);

ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all partners"
  ON public.affiliate_partners FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners view own record"
  ON public.affiliate_partners FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Partners update own payment details"
  ON public.affiliate_partners FOR UPDATE
  TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_affiliate_partners_updated_at
  BEFORE UPDATE ON public.affiliate_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TABLE: affiliate_clicks
-- ============================================================
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  ip_address text,
  user_agent text,
  referrer text,
  landing_page text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_clicks_partner_id ON public.affiliate_clicks(partner_id);
CREATE INDEX idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at DESC);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log clicks"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view all clicks"
  ON public.affiliate_clicks FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners view own clicks"
  ON public.affiliate_clicks FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: affiliate_referrals
-- ============================================================
CREATE TABLE public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL UNIQUE,
  referred_email text NOT NULL,
  referred_first_name text,
  attribution_date timestamptz NOT NULL DEFAULT now(),
  click_id uuid REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,
  conversion_status text NOT NULL DEFAULT 'signed_up' CHECK (conversion_status IN ('signed_up','trial','paid','cancelled','refunded')),
  plan_type text,
  first_paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_referrals_partner_id ON public.affiliate_referrals(partner_id);
CREATE INDEX idx_affiliate_referrals_user_id ON public.affiliate_referrals(referred_user_id);

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all referrals"
  ON public.affiliate_referrals FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners view own referrals"
  ON public.affiliate_referrals FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()));

CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON public.affiliate_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TABLE: affiliate_commissions
-- ============================================================
CREATE TABLE public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.affiliate_referrals(id) ON DELETE SET NULL,
  payout_id uuid,
  net_revenue numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','held','paid','reversed')),
  hold_until timestamptz,
  collected_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_commissions_partner_id ON public.affiliate_commissions(partner_id);
CREATE INDEX idx_affiliate_commissions_status ON public.affiliate_commissions(status);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all commissions"
  ON public.affiliate_commissions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners view own commissions"
  ON public.affiliate_commissions FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()));

CREATE TRIGGER update_affiliate_commissions_updated_at
  BEFORE UPDATE ON public.affiliate_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TABLE: affiliate_payouts
-- ============================================================
CREATE TABLE public.affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  method text NOT NULL CHECK (method IN ('ach','paypal','stripe_connect','manual')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','held','reversed')),
  period_start date,
  period_end date,
  reference text,
  notes text,
  paid_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_payouts_partner_id ON public.affiliate_payouts(partner_id);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all payouts"
  ON public.affiliate_payouts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners view own payouts"
  ON public.affiliate_payouts FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()));

CREATE TRIGGER update_affiliate_payouts_updated_at
  BEFORE UPDATE ON public.affiliate_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- HELPER: generate unique referral code
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  exists_check boolean;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS (SELECT 1 FROM public.affiliate_partners WHERE referral_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END;
$$;

-- ============================================================
-- HELPER: approve application -> create partner
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_affiliate_application(
  app_id uuid,
  custom_commission_rate numeric DEFAULT NULL,
  custom_payout_months integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app record;
  new_partner_id uuid;
  new_code text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT * INTO app FROM public.affiliate_applications WHERE id = app_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  IF app.status = 'approved' THEN
    RAISE EXCEPTION 'Application already approved';
  END IF;

  new_code := public.generate_referral_code();

  INSERT INTO public.affiliate_partners (
    application_id, email, first_name, last_name, business_name,
    partner_type, referral_code, commission_rate, payout_duration_months,
    payment_method, approved_by, approved_at
  ) VALUES (
    app.id, app.email, app.first_name, app.last_name, app.business_name,
    app.partner_type, new_code,
    COALESCE(custom_commission_rate, 20.00),
    COALESCE(custom_payout_months, 12),
    app.payment_method, auth.uid(), now()
  )
  RETURNING id INTO new_partner_id;

  UPDATE public.affiliate_applications
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = app_id;

  RETURN new_partner_id;
END;
$$;