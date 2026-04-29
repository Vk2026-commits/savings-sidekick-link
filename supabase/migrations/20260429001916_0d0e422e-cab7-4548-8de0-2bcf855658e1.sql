
-- Paddle subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  paddle_subscription_id text not null unique,
  paddle_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_paddle_id on public.subscriptions(paddle_subscription_id);

alter table public.subscriptions enable row level security;

create policy "Users view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Active subscription helper, defaults to live for safety
create or replace function public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'live'
)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid
      and environment = check_env
      and (
        (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
        or (status = 'canceled' and current_period_end > now())
      )
  );
$$;

-- Sync legacy user_subscriptions.tier from new subscriptions table
create or replace function public.sync_user_tier_from_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_active boolean;
  target_uid uuid;
begin
  target_uid := coalesce(new.user_id, old.user_id);
  select exists (
    select 1 from public.subscriptions
    where user_id = target_uid
      and (
        (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
        or (status = 'canceled' and current_period_end > now())
      )
  ) into is_active;

  insert into public.user_subscriptions (user_id, tier)
  values (target_uid, case when is_active then 'pro' else 'free' end)
  on conflict (user_id) do update
    set tier = case when is_active then 'pro' else 'free' end,
        updated_at = now();
  return new;
end;
$$;

-- user_subscriptions has no unique on user_id yet; add it for upsert
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_subscriptions_user_id_key'
  ) then
    alter table public.user_subscriptions add constraint user_subscriptions_user_id_key unique (user_id);
  end if;
end $$;

drop trigger if exists trg_sync_tier_ins on public.subscriptions;
drop trigger if exists trg_sync_tier_upd on public.subscriptions;
create trigger trg_sync_tier_ins after insert on public.subscriptions
  for each row execute function public.sync_user_tier_from_subscription();
create trigger trg_sync_tier_upd after update on public.subscriptions
  for each row execute function public.sync_user_tier_from_subscription();

-- Mark referral as paid + create commission for affiliate when transaction completes
create or replace function public.record_affiliate_commission(
  p_user_id uuid,
  p_net_amount numeric,
  p_currency text,
  p_plan_type text
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_referral record;
  v_partner record;
  v_months_elapsed numeric;
begin
  select * into v_referral
  from public.affiliate_referrals
  where referred_user_id = p_user_id
  limit 1;

  if not found then return; end if;

  select * into v_partner
  from public.affiliate_partners
  where id = v_referral.partner_id and status = 'active';

  if not found then return; end if;

  -- Stop paying after payout_duration_months window
  v_months_elapsed := extract(epoch from (now() - v_referral.attribution_date)) / (60*60*24*30);
  if v_months_elapsed > v_partner.payout_duration_months then return; end if;

  if v_referral.first_paid_at is null then
    update public.affiliate_referrals
      set conversion_status = 'paid', first_paid_at = now(), plan_type = p_plan_type, updated_at = now()
      where id = v_referral.id;
  end if;

  insert into public.affiliate_commissions (
    partner_id, referral_id, net_revenue, commission_rate, commission_amount,
    currency, status, hold_until
  ) values (
    v_partner.id, v_referral.id, p_net_amount, v_partner.commission_rate,
    round(p_net_amount * v_partner.commission_rate / 100.0, 2),
    coalesce(p_currency, 'USD'), 'pending', now() + interval '30 days'
  );
end;
$$;
