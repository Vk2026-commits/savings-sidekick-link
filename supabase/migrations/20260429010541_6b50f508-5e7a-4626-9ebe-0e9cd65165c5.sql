-- Harden admin RPCs: explicit auth check + standardized SQLSTATE for permission errors.

CREATE OR REPLACE FUNCTION public.admin_invite_affiliate_partner(
  p_email text, p_first_name text, p_last_name text,
  p_partner_type text DEFAULT 'individual'::text,
  p_business_name text DEFAULT NULL::text,
  p_commission_rate numeric DEFAULT 20.00,
  p_payout_duration_months integer DEFAULT 12,
  p_payment_method text DEFAULT 'paypal'::text
)
RETURNS TABLE(partner_id uuid, referral_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  new_id uuid;
  matched_user_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.affiliate_partners
    WHERE lower(email) = lower(p_email) AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'An active partner already exists for this email' USING ERRCODE = '23505';
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_upgrade_subscription(target_user_id uuid, new_tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  trial_end timestamp with time zone;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id is required' USING ERRCODE = '22023';
  END IF;
  IF new_tier NOT IN ('free', 'pro', 'trial_30') THEN
    RAISE EXCEPTION 'Invalid tier' USING ERRCODE = '22023';
  END IF;

  IF new_tier = 'trial_30' THEN
    trial_end := now() + interval '30 days';
    UPDATE public.user_subscriptions
    SET tier = 'trial_30', trial_expires_at = trial_end, updated_at = now()
    WHERE user_id = target_user_id;
  ELSE
    UPDATE public.user_subscriptions
    SET tier = new_tier, trial_expires_at = NULL, updated_at = now()
    WHERE user_id = target_user_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.approve_affiliate_application(
  app_id uuid,
  custom_commission_rate numeric DEFAULT NULL::numeric,
  custom_payout_months integer DEFAULT NULL::integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  app record;
  new_partner_id uuid;
  new_code text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO app FROM public.affiliate_applications WHERE id = app_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found' USING ERRCODE = 'P0002';
  END IF;
  IF app.status = 'approved' THEN
    RAISE EXCEPTION 'Application already approved' USING ERRCODE = '22023';
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
$function$;