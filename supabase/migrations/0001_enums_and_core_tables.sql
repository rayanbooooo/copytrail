-- 0001_enums_and_core_tables.sql
-- Core enums and tables for CopyTrail.

create extension if not exists "pgcrypto";

create type kyc_status_enum as enum ('pending', 'approved', 'rejected');
create type follow_status_enum as enum ('active', 'paused');
create type order_side_enum as enum ('buy', 'sell');
create type order_type_enum as enum ('market', 'limit');
create type subscription_status_enum as enum ('active', 'past_due', 'canceled');
create type trade_source_enum as enum ('self', 'copy');

-- profiles: one row per platform user, 1:1 with auth.users.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  alpaca_account_id text,
  kyc_status kyc_status_enum not null default 'pending',
  subscription_active boolean not null default false,
  subscription_renews_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- wallets: local cash/portfolio ledger mirroring (with intentional drift, see
-- README) the user's Alpaca brokerage account. 1:1 with profiles.
create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  cash_balance numeric(14, 2) not null default 0,
  portfolio_value numeric(14, 2) not null default 0,
  updated_at timestamptz not null default now()
);

-- leaders: traders who can be copy-followed. profile_id -> profiles is 1:1
-- (a user opts in to becoming a leader).
create table leaders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  bio text not null default '',
  strategy_tags text[] not null default '{}',
  risk_score smallint not null default 5 check (risk_score between 1 and 10),
  win_rate numeric(5, 2) not null default 0,
  total_return_30d numeric(7, 2) not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- follows: the copy-trading graph. A follower allocates a fixed dollar
-- amount to mirror a single leader's trades proportionally.
create table follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles (id) on delete cascade,
  leader_id uuid not null references leaders (id) on delete cascade,
  allocation_amount numeric(14, 2) not null check (allocation_amount > 0),
  status follow_status_enum not null default 'active',
  created_at timestamptz not null default now()
);

-- trades: every order this platform ever submitted to Alpaca, whether
-- self-directed or copy-engine-generated. source_trade_id links a copy fill
-- back to the leader fill that triggered it.
create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  alpaca_order_id text,
  symbol text not null,
  qty numeric(18, 6) not null check (qty > 0),
  side order_side_enum not null,
  order_type order_type_enum not null default 'market',
  execution_price numeric(14, 4),
  platform_fee numeric(6, 2) not null default 1.00,
  source trade_source_enum not null default 'self',
  source_trade_id uuid references trades (id) on delete set null,
  executed_at timestamptz
);

-- subscriptions: the $15/mo copy-trading subscription, billed via Stripe.
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  stripe_subscription_id text,
  amount numeric(6, 2) not null default 15.00,
  status subscription_status_enum not null default 'active',
  next_billing_date timestamptz,
  created_at timestamptz not null default now()
);

-- webhook_events: durable idempotency ledger + audit trail for every
-- inbound webhook (Alpaca trade updates, Stripe billing events).
create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);
