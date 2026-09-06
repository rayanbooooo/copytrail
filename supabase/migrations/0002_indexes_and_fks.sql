-- 0002_indexes_and_fks.sql
-- Uniqueness constraints and lookup indexes.

alter table profiles add constraint profiles_email_unique unique (email);
alter table profiles add constraint profiles_alpaca_account_id_unique unique (alpaca_account_id);
alter table profiles add constraint profiles_stripe_customer_id_unique unique (stripe_customer_id);

alter table wallets add constraint wallets_user_id_unique unique (user_id);

alter table leaders add constraint leaders_profile_id_unique unique (profile_id);
create index leaders_is_verified_idx on leaders (is_verified);
create index leaders_total_return_30d_idx on leaders (total_return_30d desc);

alter table follows add constraint follows_follower_leader_unique unique (follower_id, leader_id);
create index follows_follower_id_idx on follows (follower_id);
-- Partial index: the copy-engine's hot-path fan-out query only ever needs
-- active followers of a given leader.
create index follows_active_leader_id_idx on follows (leader_id) where status = 'active';

alter table trades add constraint trades_alpaca_order_id_unique unique (alpaca_order_id);
create index trades_user_id_executed_at_idx on trades (user_id, executed_at desc);
create index trades_source_trade_id_idx on trades (source_trade_id);
create index trades_symbol_idx on trades (symbol);

alter table subscriptions add constraint subscriptions_stripe_subscription_id_unique unique (stripe_subscription_id);
create index subscriptions_user_id_idx on subscriptions (user_id);

alter table webhook_events add constraint webhook_events_source_external_id_unique unique (source, external_id);
create index webhook_events_source_idx on webhook_events (source);
