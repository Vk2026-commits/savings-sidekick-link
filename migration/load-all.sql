-- =============================================================================
-- Faithnancial → New Supabase: full data load script
-- =============================================================================
-- Usage:
--   1. Put all exported CSVs in the same directory as this file.
--   2. Run:  psql "postgres://postgres.<new-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" -f load-all.sql
--
-- Assumes:
--   - Schema already exists in the target DB (Track B / `supabase db push`).
--   - CSVs were exported from Lovable Cloud → Advanced settings → Export data
--     and follow the same column order as the source tables.
--   - auth.users export includes id + encrypted_password so logins keep working.
--
-- Safety:
--   - Wrapped in a single transaction — any error rolls the whole thing back.
--   - session_replication_role='replica' disables triggers (incl. handle_new_user)
--     during load so imported profiles/user_roles rows don't collide with the
--     auto-create trigger.
-- =============================================================================

\set ON_ERROR_STOP on
\timing on

BEGIN;
SET session_replication_role = 'replica';

-- ---------------------------------------------------------------------------
-- 1. auth.* — MUST come first (everything FKs to auth.users.id)
-- ---------------------------------------------------------------------------
\echo '=== Loading auth.users ==='
\copy auth.users FROM 'auth_users.csv' WITH CSV HEADER
\echo '=== Loading auth.identities ==='
\copy auth.identities FROM 'auth_identities.csv' WITH CSV HEADER

-- ---------------------------------------------------------------------------
-- 2. Core user-scoped tables (parents before children)
-- ---------------------------------------------------------------------------
\echo '=== Core user tables ==='
\copy public.profiles              FROM 'profiles.csv'              WITH CSV HEADER
\copy public.user_roles            FROM 'user_roles.csv'            WITH CSV HEADER
\copy public.user_subscriptions    FROM 'user_subscriptions.csv'    WITH CSV HEADER
\copy public.subscriptions         FROM 'subscriptions.csv'         WITH CSV HEADER
\copy public.user_pins             FROM 'user_pins.csv'             WITH CSV HEADER
\copy public.user_onboarding       FROM 'user_onboarding.csv'       WITH CSV HEADER

-- ---------------------------------------------------------------------------
-- 3. Budget domain
-- ---------------------------------------------------------------------------
\echo '=== Budget domain ==='
\copy public.expense_groups        FROM 'expense_groups.csv'        WITH CSV HEADER
\copy public.payment_accounts      FROM 'payment_accounts.csv'      WITH CSV HEADER
\copy public.income_sources        FROM 'income_sources.csv'        WITH CSV HEADER
\copy public.category_budgets      FROM 'category_budgets.csv'      WITH CSV HEADER
\copy public.savings_goals         FROM 'savings_goals.csv'         WITH CSV HEADER
\copy public.bills                 FROM 'bills.csv'                 WITH CSV HEADER
\copy public.transactions          FROM 'transactions.csv'          WITH CSV HEADER
\copy public.assets                FROM 'assets.csv'                WITH CSV HEADER
\copy public.liabilities           FROM 'liabilities.csv'           WITH CSV HEADER
\copy public.linked_accounts       FROM 'linked_accounts.csv'       WITH CSV HEADER
\copy public.plaid_secrets         FROM 'plaid_secrets.csv'         WITH CSV HEADER
\copy public.preparedness_checklist FROM 'preparedness_checklist.csv' WITH CSV HEADER
\copy public.faith_devotional_log  FROM 'faith_devotional_log.csv'  WITH CSV HEADER

-- ---------------------------------------------------------------------------
-- 4. Estate domain (parents first, links last)
-- ---------------------------------------------------------------------------
\echo '=== Estate domain ==='
\copy public.estate_people             FROM 'estate_people.csv'             WITH CSV HEADER
\copy public.estate_beneficiaries      FROM 'estate_beneficiaries.csv'      WITH CSV HEADER
\copy public.estate_accounts           FROM 'estate_accounts.csv'           WITH CSV HEADER
\copy public.estate_insurance          FROM 'estate_insurance.csv'          WITH CSV HEADER
\copy public.estate_property           FROM 'estate_property.csv'           WITH CSV HEADER
\copy public.estate_digital_access     FROM 'estate_digital_access.csv'     WITH CSV HEADER
\copy public.estate_legal_documents    FROM 'estate_legal_documents.csv'    WITH CSV HEADER
\copy public.estate_documents          FROM 'estate_documents.csv'          WITH CSV HEADER
\copy public.estate_wishes             FROM 'estate_wishes.csv'             WITH CSV HEADER
\copy public.estate_trusted_contacts   FROM 'estate_trusted_contacts.csv'   WITH CSV HEADER
\copy public.estate_access_requests    FROM 'estate_access_requests.csv'    WITH CSV HEADER
\copy public.estate_tab_status         FROM 'estate_tab_status.csv'         WITH CSV HEADER
\copy public.estate_beneficiary_links  FROM 'estate_beneficiary_links.csv'  WITH CSV HEADER
\copy public.estate_audit_log          FROM 'estate_audit_log.csv'          WITH CSV HEADER
\copy public.document_access_log       FROM 'document_access_log.csv'       WITH CSV HEADER

-- ---------------------------------------------------------------------------
-- 5. Affiliate + admin
-- ---------------------------------------------------------------------------
\echo '=== Affiliate + admin ==='
\copy public.affiliate_applications           FROM 'affiliate_applications.csv'           WITH CSV HEADER
\copy public.affiliate_partners               FROM 'affiliate_partners.csv'               WITH CSV HEADER
\copy public.affiliate_agreement_acceptances  FROM 'affiliate_agreement_acceptances.csv'  WITH CSV HEADER
\copy public.affiliate_clicks                 FROM 'affiliate_clicks.csv'                 WITH CSV HEADER
\copy public.affiliate_referrals              FROM 'affiliate_referrals.csv'              WITH CSV HEADER
\copy public.affiliate_commissions            FROM 'affiliate_commissions.csv'            WITH CSV HEADER
\copy public.affiliate_payouts                FROM 'affiliate_payouts.csv'                WITH CSV HEADER
\copy public.admin_audit_log                  FROM 'admin_audit_log.csv'                  WITH CSV HEADER

-- ---------------------------------------------------------------------------
-- 6. Email infrastructure (optional — comment out if starting fresh)
-- ---------------------------------------------------------------------------
\echo '=== Email infrastructure (optional history) ==='
\copy public.email_send_log            FROM 'email_send_log.csv'            WITH CSV HEADER
\copy public.suppressed_emails         FROM 'suppressed_emails.csv'         WITH CSV HEADER
\copy public.email_unsubscribe_tokens  FROM 'email_unsubscribe_tokens.csv'  WITH CSV HEADER
\copy public.plan_reminder_log         FROM 'plan_reminder_log.csv'         WITH CSV HEADER

-- ---------------------------------------------------------------------------
-- 7. Re-enable triggers and commit
-- ---------------------------------------------------------------------------
SET session_replication_role = 'origin';
COMMIT;

-- ---------------------------------------------------------------------------
-- 8. Verification — row counts
-- ---------------------------------------------------------------------------
\echo ''
\echo '=== Row counts (compare against source exports) ==='
SELECT 'auth.users'          AS table_name, count(*) FROM auth.users
UNION ALL SELECT 'profiles',            count(*) FROM public.profiles
UNION ALL SELECT 'user_roles',          count(*) FROM public.user_roles
UNION ALL SELECT 'user_subscriptions',  count(*) FROM public.user_subscriptions
UNION ALL SELECT 'subscriptions',       count(*) FROM public.subscriptions
UNION ALL SELECT 'bills',               count(*) FROM public.bills
UNION ALL SELECT 'transactions',        count(*) FROM public.transactions
UNION ALL SELECT 'income_sources',      count(*) FROM public.income_sources
UNION ALL SELECT 'savings_goals',       count(*) FROM public.savings_goals
UNION ALL SELECT 'assets',              count(*) FROM public.assets
UNION ALL SELECT 'liabilities',         count(*) FROM public.liabilities
UNION ALL SELECT 'estate_documents',    count(*) FROM public.estate_documents
UNION ALL SELECT 'estate_people',       count(*) FROM public.estate_people
UNION ALL SELECT 'affiliate_partners',  count(*) FROM public.affiliate_partners
UNION ALL SELECT 'affiliate_commissions', count(*) FROM public.affiliate_commissions
ORDER BY table_name;

\echo ''
\echo '=== Done. Next: upload estate-documents storage files (Track C step 9). ==='
