
-- 1. Fix estate_access_requests INSERT policy (removes WITH CHECK true)
DROP POLICY IF EXISTS "Authenticated insert access requests" ON public.estate_access_requests;

CREATE POLICY "Authenticated insert access requests"
ON public.estate_access_requests
FOR INSERT
TO authenticated
WITH CHECK (
  requester_email = (auth.jwt() ->> 'email')
  AND trusted_contact_id IN (
    SELECT id FROM public.estate_trusted_contacts WHERE user_id = estate_access_requests.user_id
  )
);

-- 2. Secure Plaid access tokens
-- Create a secure table for tokens (service role only)
CREATE TABLE public.plaid_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  linked_account_id uuid NOT NULL,
  access_token text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plaid_secrets ENABLE ROW LEVEL SECURITY;

-- No policies = only service_role can access

-- Migrate existing tokens
INSERT INTO public.plaid_secrets (user_id, linked_account_id, access_token)
SELECT user_id, id, access_token FROM public.linked_accounts;

-- Create a safe view that omits the token
CREATE VIEW public.linked_accounts_safe
WITH (security_invoker = on) AS
SELECT id, user_id, institution_name, institution_id, item_id, account_ids, created_at, updated_at
FROM public.linked_accounts;

-- Block direct SELECT on linked_accounts base table
DROP POLICY IF EXISTS "Users manage own linked_accounts" ON public.linked_accounts;

CREATE POLICY "Users select own linked_accounts via view"
ON public.linked_accounts
FOR SELECT
USING (false);

CREATE POLICY "Users insert own linked_accounts"
ON public.linked_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own linked_accounts"
ON public.linked_accounts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own linked_accounts"
ON public.linked_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Grant view access
GRANT SELECT ON public.linked_accounts_safe TO authenticated;
GRANT SELECT ON public.linked_accounts_safe TO anon;
