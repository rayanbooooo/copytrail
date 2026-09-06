-- seed.sql — dev-only fixtures for the Feed & Leaderboard screen so it's
-- demoable against `supabase start` with zero external APIs configured.
-- Not run against production; supabase CLI applies this after migrations
-- when running `supabase db reset` locally.

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'mara.chen@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'devon.oyelaran@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'lena.vasquez@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'demo.follower@example.com', crypt('password123', gen_salt('bf')), now(), now(), now())
on conflict (id) do nothing;

-- profiles/wallets rows are normally created by handle_new_user(); seeded
-- directly here since the trigger only fires on real Supabase Auth signups.
update profiles set kyc_status = 'approved', subscription_active = true
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

update wallets set cash_balance = 4820.11, portfolio_value = 18230.44
where user_id = '00000000-0000-0000-0000-000000000004';

insert into leaders (id, profile_id, bio, strategy_tags, risk_score, win_rate, total_return_30d, is_verified)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Ten years trading G10 majors. Swing positions held 2-5 days, hard stops, no averaging down.',
    array['Forex Majors', 'Swing'],
    4,
    68.40,
    12.30,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Momentum breakouts on large-cap tech. Intraday and multi-day holds depending on volume.',
    array['Large Cap Tech', 'Momentum'],
    7,
    54.10,
    24.80,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Defensive dividend rotation across utilities and staples. Low turnover, capital preservation first.',
    array['Dividend', 'Low Volatility'],
    2,
    71.90,
    5.60,
    false
  )
on conflict (id) do nothing;

insert into follows (follower_id, leader_id, allocation_amount, status)
values
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 1500.00, 'active')
on conflict (follower_id, leader_id) do nothing;

insert into trades (user_id, alpaca_order_id, symbol, qty, side, order_type, execution_price, platform_fee, source, executed_at)
values
  ('00000000-0000-0000-0000-000000000004', 'seed-order-0001', 'EURUSD', 10000, 'buy', 'market', 1.0842, 0, 'copy', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000004', 'seed-order-0002', 'AAPL', 5, 'buy', 'market', 227.15, 1.00, 'self', now() - interval '1 day')
on conflict (alpaca_order_id) do nothing;
