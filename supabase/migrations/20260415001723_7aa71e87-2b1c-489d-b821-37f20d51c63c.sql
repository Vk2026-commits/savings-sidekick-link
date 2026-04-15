
-- The INSERT policy was already replaced. Now clean up the duplicate SELECT attempt.
-- The existing "Users can read own subscription" SELECT policy is already in place, so just drop the UPDATE policy.
-- (The INSERT was already replaced in the previous migration that partially succeeded.)

-- Nothing to do for SELECT - it already exists.
-- Just need to confirm UPDATE is gone (it was dropped in the previous migration).
-- So this migration is a no-op confirmation. Let's just add the admin function and plaid policy.

CREATE OR REPLACE FUNCTION public.admin_upgrade_subscription(target_user_id uuid, new_tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF new_tier NOT IN ('free', 'pro') THEN
    RAISE EXCEPTION 'Invalid tier';
  END IF;
  UPDATE public.user_subscriptions SET tier = new_tier, updated_at = now() WHERE user_id = target_user_id;
END;
$$;

CREATE POLICY "No public access to plaid_secrets"
ON public.plaid_secrets
FOR ALL
TO public
USING (false)
WITH CHECK (false);
