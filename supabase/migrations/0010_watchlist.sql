-- 0010_watchlist.sql
-- Per-user watchlist of symbols, backing the star toggle on the asset
-- detail screen and the dedicated Watchlist tab.

create table watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  symbol text not null,
  created_at timestamptz not null default now()
);

alter table watchlist_items add constraint watchlist_items_user_symbol_unique unique (user_id, symbol);
create index watchlist_items_user_id_idx on watchlist_items (user_id);

alter table watchlist_items enable row level security;

create policy "watchlist_items_select_own" on watchlist_items
  for select using (auth.uid() = user_id);

create policy "watchlist_items_insert_own" on watchlist_items
  for insert with check (auth.uid() = user_id);

create policy "watchlist_items_delete_own" on watchlist_items
  for delete using (auth.uid() = user_id);
