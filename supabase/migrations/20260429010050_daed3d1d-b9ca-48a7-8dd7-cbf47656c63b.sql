-- Lock down SECURITY DEFINER functions: revoke from public/anon, grant only to authenticated where appropriate.
-- Admin-only functions (admin check is enforced inside the function):
REVOKE ALL ON FUNCTION public.admin_invite_affiliate_partner(text, text, text, text, text, numeric, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_invite_affiliate_partner(text, text, text, text, text, numeric, integer, text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_upgrade_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_upgrade_subscription(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.approve_affiliate_application(uuid, numeric, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_affiliate_application(uuid, numeric, integer) TO authenticated;

-- Helper / referral-code generator: only used internally by other SECURITY DEFINER functions; nothing should call it directly from the API.
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;

-- Commission recorder: only ever invoked from the payments webhook (service role); not callable by clients.
REVOKE ALL ON FUNCTION public.record_affiliate_commission(uuid, numeric, text, text) FROM PUBLIC, anon, authenticated;

-- Trigger functions — never invoked directly via the API; revoke broad EXECUTE.
REVOKE ALL ON FUNCTION public.link_affiliate_partner_on_signup() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_user_tier_from_subscription() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Subscription check helper: leave callable by authenticated users (used by app code), revoke from anon.
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;

-- Role check helper: needed by RLS policies (runs as the calling user); keep authenticated, revoke anon.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;