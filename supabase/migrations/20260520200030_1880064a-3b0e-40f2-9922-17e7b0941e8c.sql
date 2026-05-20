WITH ranked AS (
  SELECT id, user_id, name,
         FIRST_VALUE(id) OVER (PARTITION BY user_id, name ORDER BY created_at, id) AS keep_id
  FROM public.payment_accounts
)
UPDATE public.bills b
SET payment_account_id = r.keep_id::text
FROM ranked r
WHERE b.payment_account_id = r.id::text
  AND r.id <> r.keep_id;

DELETE FROM public.payment_accounts pa
USING (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id, name ORDER BY created_at, id) AS rn
  FROM public.payment_accounts
) d
WHERE pa.id = d.id AND d.rn > 1;

ALTER TABLE public.payment_accounts
  ADD CONSTRAINT payment_accounts_user_name_unique UNIQUE (user_id, name);