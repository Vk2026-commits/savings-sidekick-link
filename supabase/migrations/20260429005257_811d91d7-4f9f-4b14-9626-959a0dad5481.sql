-- 1. Auto-link affiliate_partners.user_id when a user signs up with a matching email
CREATE OR REPLACE FUNCTION public.link_affiliate_partner_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.affiliate_partners
    SET user_id = NEW.id, updated_at = now()
    WHERE lower(email) = lower(NEW.email)
      AND user_id IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_affiliate_partner_on_signup ON auth.users;
CREATE TRIGGER link_affiliate_partner_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_affiliate_partner_on_signup();

-- Backfill: link any existing users to existing partner records by email
UPDATE public.affiliate_partners ap
  SET user_id = u.id, updated_at = now()
  FROM auth.users u
  WHERE ap.user_id IS NULL
    AND lower(ap.email) = lower(u.email);

-- 2. Admin: directly invite (create) an approved partner, skipping the application
CREATE OR REPLACE FUNCTION public.admin_invite_affiliate_partner(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_partner_type text DEFAULT 'individual',
  p_business_name text DEFAULT NULL,
  p_commission_rate numeric DEFAULT 20.00,
  p_payout_duration_months integer DEFAULT 12,
  p_payment_method text DEFAULT 'paypal'
)
RETURNS TABLE (partner_id uuid, referral_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  new_id uuid;
  matched_user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Prevent duplicate active partner for the same email
  IF EXISTS (
    SELECT 1 FROM public.affiliate_partners
    WHERE lower(email) = lower(p_email) AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'An active partner already exists for this email';
  END IF;

  new_code := public.generate_referral_code();

  SELECT id INTO matched_user_id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;

  INSERT INTO public.affiliate_partners (
    email, first_name, last_name, business_name, partner_type,
    referral_code, commission_rate, payout_duration_months,
    payment_method, approved_by, approved_at, user_id, status
  ) VALUES (
    p_email, coalesce(p_first_name, ''), coalesce(p_last_name, ''),
    p_business_name, coalesce(p_partner_type, 'individual'),
    new_code, p_commission_rate, p_payout_duration_months,
    p_payment_method, auth.uid(), now(), matched_user_id, 'active'
  )
  RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, new_code;
END;
$$;