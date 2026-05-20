CREATE POLICY "Admins insert audit entries"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND admin_id = auth.uid()
);