
-- 1. Fix: Users can escalate their own subscription tier
-- Drop the permissive UPDATE policy and replace with a restricted one
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;

CREATE POLICY "Users can update own subscription safe"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND tier = (SELECT tier FROM public.user_subscriptions WHERE user_id = auth.uid())
);

-- 2. Fix: plan_reminder_log has no RLS policies
-- Only allow users to read their own reminder logs (inserts are done server-side)
CREATE POLICY "Users can read own reminders"
ON public.plan_reminder_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Fix: Regular users cannot read their own roles
CREATE POLICY "Users can read own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
