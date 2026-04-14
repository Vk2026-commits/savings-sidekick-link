
-- Fix estate_audit_log INSERT policy
DROP POLICY IF EXISTS "Authenticated insert audit entries" ON public.estate_audit_log;

CREATE POLICY "Authenticated insert audit entries"
ON public.estate_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
