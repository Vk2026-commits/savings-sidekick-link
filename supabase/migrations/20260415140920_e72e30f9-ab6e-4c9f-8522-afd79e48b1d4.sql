
CREATE OR REPLACE FUNCTION public.admin_upgrade_subscription(target_user_id uuid, new_tier text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  trial_end timestamp with time zone;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF new_tier NOT IN ('free', 'pro', 'trial_30') THEN
    RAISE EXCEPTION 'Invalid tier';
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
