
-- Add trial_expires_at column to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN trial_expires_at timestamp with time zone DEFAULT NULL;

-- Update admin_upgrade_subscription to support trial tiers
CREATE OR REPLACE FUNCTION public.admin_upgrade_subscription(target_user_id uuid, new_tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_end timestamp with time zone;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF new_tier NOT IN ('free', 'pro', 'trial_30', 'trial_90') THEN
    RAISE EXCEPTION 'Invalid tier';
  END IF;

  IF new_tier = 'trial_30' THEN
    trial_end := now() + interval '30 days';
    UPDATE public.user_subscriptions 
    SET tier = 'trial_30', trial_expires_at = trial_end, updated_at = now() 
    WHERE user_id = target_user_id;
  ELSIF new_tier = 'trial_90' THEN
    trial_end := now() + interval '90 days';
    UPDATE public.user_subscriptions 
    SET tier = 'trial_90', trial_expires_at = trial_end, updated_at = now() 
    WHERE user_id = target_user_id;
  ELSE
    UPDATE public.user_subscriptions 
    SET tier = new_tier, trial_expires_at = NULL, updated_at = now() 
    WHERE user_id = target_user_id;
  END IF;
END;
$$;

-- Update INSERT policy to only allow 'free' tier (keep existing restriction)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscription"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND tier = 'free');
