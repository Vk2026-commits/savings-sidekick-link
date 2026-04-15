
-- Fix: Estate access request INSERT allows impersonation
DROP POLICY IF EXISTS "Authenticated insert access requests" ON public.estate_access_requests;

CREATE POLICY "Authenticated insert access requests"
ON public.estate_access_requests
FOR INSERT
TO authenticated
WITH CHECK (
  requester_email = (auth.jwt() ->> 'email')
  AND trusted_contact_id IN (
    SELECT id FROM public.estate_trusted_contacts
    WHERE user_id = estate_access_requests.user_id
    AND contact_email = (auth.jwt() ->> 'email')
  )
);
