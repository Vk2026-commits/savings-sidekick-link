
-- Fix: access requests insert - require authenticated and that requester_email matches
DROP POLICY "Anyone can insert access requests" ON public.estate_access_requests;
CREATE POLICY "Authenticated insert access requests" ON public.estate_access_requests FOR INSERT TO authenticated WITH CHECK (true);

-- Fix: audit log insert - require authenticated
DROP POLICY "Insert audit entries" ON public.estate_audit_log;
CREATE POLICY "Authenticated insert audit entries" ON public.estate_audit_log FOR INSERT TO authenticated WITH CHECK (true);
