-- 0003_rls_policies.sql
-- Deny-by-default row level security. Every table starts locked; policies
-- below open only the specific access patterns the app needs. Any write not
-- covered by an explicit policy here happens through the service-role key
-- (server actions / webhook handlers), which bypasses RLS entirely.

alter table profiles enable row level security;
alter table wallets enable row level security;
alter table leaders enable row level security;
alter table follows enable row level security;
alter table trades enable row level security;
alter table subscriptions enable row level security;
alter table webhook_events enable row level security;

-- profiles: users can read and update their own row. Row creation happens
-- via the handle_new_user() trigger (0006), never a direct client insert.
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- wallets: read-only from the client. cash_balance/portfolio_value are only
-- ever written by trusted server code (fee debits, Alpaca account sync).
create policy "wallets_select_own" on wallets
  for select using (auth.uid() = user_id);

-- leaders: publicly browsable leaderboard for any signed-in user. No client
-- insert/update/delete — risk_score/win_rate/total_return_30d are
-- system-computed, and bio/strategy_tags edits go through a server action
-- (updateLeaderProfile) with its own ownership check, since RLS can't split
-- writable vs. system-owned columns within one row.
create policy "leaders_select_all" on leaders
  for select using (auth.role() = 'authenticated');

-- follows: a follower fully owns their own copy-trading relationships.
create policy "follows_select_own" on follows
  for select using (auth.uid() = follower_id);

create policy "follows_insert_own" on follows
  for insert with check (auth.uid() = follower_id);

create policy "follows_update_own" on follows
  for update using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

create policy "follows_delete_own" on follows
  for delete using (auth.uid() = follower_id);

-- trades: read-only from the client. All writes (self-directed order
-- submission, copy-engine fan-out, webhook reconciliation) go through
-- service-role server code so the $1 fee/wallet-debit invariant can't be
-- bypassed by a direct client insert.
create policy "trades_select_own" on trades
  for select using (auth.uid() = user_id);

-- subscriptions: read-only from the client; writes only via the Stripe
-- webhook handler (service role).
create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);

-- webhook_events: no policies beyond RLS being enabled — service role only.
