
-- 1. Reassign bills.owner from duplicate group ids to the earliest surviving group per (user_id, name)
WITH ranked AS (
  SELECT id, user_id, name,
         FIRST_VALUE(id) OVER (PARTITION BY user_id, name ORDER BY created_at, id) AS keep_id
  FROM public.expense_groups
)
UPDATE public.bills b
SET owner = r.keep_id::text
FROM ranked r
WHERE b.owner = r.id::text
  AND r.id <> r.keep_id;

-- 2. Delete duplicate expense_groups (keep earliest per user+name)
DELETE FROM public.expense_groups eg
USING (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id, name ORDER BY created_at, id) AS rn
  FROM public.expense_groups
) d
WHERE eg.id = d.id AND d.rn > 1;

-- 3. Rename Bills -> Expenses for family groups (skip if target name already exists for that user)
UPDATE public.expense_groups eg
SET name = 'Daughter''s Expenses', updated_at = now()
WHERE name = 'Daughter''s Bills'
  AND NOT EXISTS (
    SELECT 1 FROM public.expense_groups eg2
    WHERE eg2.user_id = eg.user_id AND eg2.name = 'Daughter''s Expenses'
  );

UPDATE public.expense_groups eg
SET name = 'Son''s Expenses', updated_at = now()
WHERE name = 'Son''s Bills'
  AND NOT EXISTS (
    SELECT 1 FROM public.expense_groups eg2
    WHERE eg2.user_id = eg.user_id AND eg2.name = 'Son''s Expenses'
  );

UPDATE public.expense_groups eg
SET name = 'Wife''s Expenses', updated_at = now()
WHERE name = 'Wife''s Bills'
  AND NOT EXISTS (
    SELECT 1 FROM public.expense_groups eg2
    WHERE eg2.user_id = eg.user_id AND eg2.name = 'Wife''s Expenses'
  );

-- 4. Add unique constraint
ALTER TABLE public.expense_groups
  ADD CONSTRAINT expense_groups_user_name_unique UNIQUE (user_id, name);
