-- 0011_wallet_snapshots.sql
-- Daily wallet value snapshots, so the Home screen's portfolio sparkline is
-- built from real history rather than a fabricated line. Populated by
-- app/api/cron/sync-accounts (once daily on the Hobby plan's cron limit);
-- empty until the first sync runs, at which point Sparkline's built-in
-- empty state (a flat baseline) is exactly the correct rendering.

create table wallet_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  snapshot_date date not null default current_date,
  cash_balance numeric(14, 2) not null,
  portfolio_value numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

alter table wallet_snapshots add constraint wallet_snapshots_user_date_unique unique (user_id, snapshot_date);
create index wallet_snapshots_user_id_date_idx on wallet_snapshots (user_id, snapshot_date desc);

alter table wallet_snapshots enable row level security;

create policy "wallet_snapshots_select_own" on wallet_snapshots
  for select using (auth.uid() = user_id);

-- No client insert/update/delete policy — written only by the cron sync
-- route via the service-role client.
